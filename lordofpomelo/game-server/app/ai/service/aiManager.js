var Blackboard = require('../meta/blackboard');
var EntityType = require('../../consts/consts').EntityType;

var exp = module.exports;

//ai管理器属性有：大脑服务、场景、玩家、怪物
var Manager = function(opts) {
	this.brainService = opts.brainService;
	this.area = opts.area;
	this.players = {};
	this.mobs = {};
};

module.exports = Manager;

var pro = Manager.prototype;

pro.start = function() {
	this.started = true;
};

pro.stop = function() {
	this.closed = true;
};

/**
 * Add a character into ai manager.
 * Add a brain to the character if the type is mob.
 * Start the tick if it has not started yet.
 * 增加一个角色到ai管理器。如果角色类型为怪物，增加一个大脑。如果没开始则开始计时。
 */
pro.addCharacters = function(cs) {
	 // return;
	//如果还没开始或已经结束，则不增加角色大脑
	if(!this.started || this.closed) {
		return;
	}

	if(!cs || !cs.length) {
		return;
	}

	//create brain for the character.
	//给角色创建大脑，玩家或者怪物
	//根据参数给的type属性，决定添加的大脑到players或mobs
	//TODO: add a brain pool?
	var c;
	for(var i=0, l=cs.length; i<l; i++) {
		c = cs[i];
		var brain;
		//如果c.type的类型为玩家，continue才执行后面
		if(c.type ===EntityType.PLAYER) {
			// continue;
			if(this.players[c.entityId]) {
				continue;
			}

			brain = this.brainService.getBrain('player', Blackboard.create({
				manager: this,
				area: this.area,
				curCharacter: c
			}));
			this.players[c.entityId] = brain;
		} else {
			//如果c.type的类型不为玩家，并在还没有在怪物组里
			if(this.mobs[c.entityId]) {
				continue;
			}
            //return;
			brain = this.brainService.getBrain(c.characterName, Blackboard.create({
				manager: this,
				area: this.area,
				curCharacter: c
			}));
			this.mobs[c.entityId] = brain;
		}
	}
};

/**
 * remove a character by id from ai manager
 * 从ai管理器中通过id删除一个角色，（id为entityId）
 */
pro.removeCharacter = function(id) {
	//如果还没开始或已经结束，则不执行删除操作
	if(!this.started || this.closed) {
		return;
	}

	delete this.players[id];
	delete this.mobs[id];
};

/**
 * Update all the managed characters.
 * Stop the tick if there is no ai mobs.
 * 更新角色和怪物大脑，如果没有怪物ai，停止时间
 */
pro.update = function() {
	//return;
	if(!this.started || this.closed) {
		return;
	}
	var id;
	for(id in this.players) {
		// if(typeof this.players[id].update === 'function') {
			this.players[id].update();
		// }
	}
	for(id in this.mobs) {
		// if(typeof this.mobs[id].update === 'function') {
			this.mobs[id].update();
		// }
	}
};

