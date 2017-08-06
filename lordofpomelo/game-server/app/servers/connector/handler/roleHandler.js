var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
// var equipDao = require('../../../dao/equipmentsDao');
// var bagDao = require('../../../dao/bagDao');
var consts = require('../../../consts/consts');
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var async = require('async');
var dataApi = require('../../../util/dataApi');
var userDao = require('../../../dao/userDao');
var fightskillDao = require('../../../dao/fightskillDao');
var forbid_word = require('../../../../config/data/forbid_word');
var mainTaskDao = require('../../../dao/mainTaskDao');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

Handler.prototype.createPlayer = function(msg, session, next) {
	var uid = msg.uid;
	var kindId = msg.kindId;
	var name = msg.name;
	var self = this;

	if (!name || name.length === 0) {
		next(null, {
			code: 1
		});
		return;
	}

	//起名字 过滤禁用字眼
	var fbword = null;
	var searchIndex = null;
	for (var i = 0; i < forbid_word.length; i++) {
		fbword = forbid_word[i]
		searchIndex = name.indexOf(fbword);
		if (searchIndex > 0) {
			next(null, {
				code: 2
			});
			return;
		}
	};

	//通过角色名查找数据库是否重名
	userDao.getSQLPlayerByName(name, function(err, player) {
		if (player) {
			next(null, {
				code: 66
			});
			return;
		}

		//没有重名，数据库创建角色，返回player：{uid, kindId, skinId, name, 1, hp, mp}
		userDao.createPlayer(uid, name, kindId, function(err, player) {
			if (err) {
				logger.error('[register] fail to invoke createPlayer for ' + err.stack);
				if (player) {
					next(null, {
						code: 4,
						error: err
					});
				} else {
					next(null, {
						code: 67,
						error: err
					});
				}
				return;
			} else {
				async.parallel([
						function(callback) {
							//创建主线任务
							mainTaskDao.createMainTaskByPlayId(player.id, callback);
						},
						function(callback) {
							//角色1级初始信息
							var character = dataApi.character.findById(kindId);
							//战斗技能数据
							var skillData = dataApi.fightskill.findById(character.skillId);
							var fightSkill = {
								skillId: character.skillId,
								level: 1,
								playerId: player.id,
								type: skillData.type
							};
							fightSkill.position = 1;
							fightskillDao.add(fightSkill, callback);
						}
					],
					function(err, results) {
						if (err) {
							logger.error('error player data init: ' + JSON.stringify(player) + ' stack: ' + err.stack);
							next(null, {
								code: 68,
								error: err
							});
							return;
						}
						next(null, {
							code: 200,
							playerId: player.id
						});
					});
			}
		});
	});
};
