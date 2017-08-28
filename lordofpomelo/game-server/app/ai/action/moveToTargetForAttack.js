var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = consts.EntityType;
var ActionType = consts.ActionType;

var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Move the character to the target.
 * 移动角色到目标
 * @return {Number} bt.RES_SUCCESS if the character already next to the target;
 *					bt.RES_WAIT if the character need to move to the target;
 *					bt.RES_FAIL if any fails
 */
pro.doAction = function() {

	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	// ps：blackboard.curTarget是由大脑player脚本的haveTarget赋值
	var targetId = blackboard.curTarget;
	var target = blackboard.area.getEntity(targetId);

	// console.log("AI moveToTargetForAttack=============>>"+character.characterData.name);
	
	//目标是否存在
	if (!target || target.died) {
		// console.log("AI moveToTargetForAttack=============>>!target");
		// target has disappeared or died
		character.forgetHater(targetId);
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	//当前目标是否匹配角色目标，初始化黑板部分属性
	if (targetId !== character.target) {
		// console.log("AI moveToTargetForAttack=============>>target changed");
		//target has changed
		blackboard.curTarget = null;
		blackboard.distanceLimit = 0;
		blackboard.targetPos = null;
		blackboard.moved = false;
		return bt.RES_FAIL;
	}
	// var distance;
	//如果攻击距离限制distanceLimit为0
	if (!blackboard.distanceLimit) {
		// var skillId;
		// if (character.type === EntityType.MOB) {
		// 	skillId=character.curSkill;
		// }else{
			// skillId=character.getAvailableSkill();
			// character.curSkill=skillId;
		// }
		//角色获取可用技能id
		var skillId=character.getAvailableSkill();
		if (!skillId) {
			// console.log("AI moveToTargetForAttack=============>>!skillId");
			//如果可用技能id没有，获取普通技能id（普通攻击）
			skillId = character.normalSkill;
			//战斗技能
			var fightSkill = character.fightSkills[skillId];
			//黑板的技能距离可以从战斗技能中获取
			blackboard.distanceLimit=fightSkill.distance;
			// return bt.RES_WAIT;
		}else{
			// console.log("AI moveToTargetForAttack=============>>skillId");
			//如果可用技能id存在，存进当前技能
			character.curSkill = skillId;
			var fightSkill = character.fightSkills[skillId];
			blackboard.distanceLimit = fightSkill.distance;
		}
	}
	//攻击距离
	var distance = blackboard.distanceLimit || 150;
	//判断目标是否在角色攻击距离内，如果在，停止移动，返回成功
	if (formula.inRange(character, target, distance)) {
		// console.log("AI moveToTargetForAttack=============>>in distance");

		//如果目标在范围内，停止移动
		blackboard.area.timer.abortAction(ActionType.MOVE, character.entityId);
		blackboard.distanceLimit = 0;
		blackboard.moved = false;

		// if (character.type===EntityType.PLAYER) {
		// 	character.target=null;
		// 	blackboard.curTarget = null;
		// }

		return bt.RES_SUCCESS;
	}

	//如果角色类型为怪物，而且距离超过500，返回失败
	if (character.type === EntityType.MOB) {
		if (Math.abs(character.x - character.spawnX) > 500 ||
			Math.abs(character.y - character.spawnY) > 500) {

			// console.log("AI moveToTargetForAttack=============>>leave");
			//we move too far and it is time to turn back
			character.forgetHater(targetId);
			blackboard.moved = false;
			character.target = null;
			return bt.RES_FAIL;
		}
	}

	//目标位置
	var targetPos = blackboard.targetPos;
	//（上面已经判断：角色不在攻击范围内，角色类型不是怪物）如果移动停止或没有黑板目标坐标点，则赋值
	if (!blackboard.moved || !targetPos) {
		// console.log("AI moveToTargetForAttack=============>>move");
		//执行角色移动函数。。。并赋值moved、targetPos 
		character.move(target.x, target.y, true, function(err, result) {
			if (err || result === false) {
				blackboard.moved = false;
				character.target = null;
			} else {
				character.setIsMoving(true);
			}
		});

		blackboard.targetPos = {
			x: target.x,
			y: target.y
		};
		blackboard.moved = true;
		//角色在移动，有黑板目标点，如果该目标点不匹配当前目标点
	} else if (targetPos && (targetPos.x !== target.x || targetPos.y !== target.y)) {
		// console.log("AI moveToTargetForAttack=============>>move continue");

		//黑板目标点与当前目标点距离
		var dis1 = formula.distance(targetPos.x, targetPos.y, target.x, target.y);
		//角色坐标与当前目标点距离
		var dis2 = formula.distance(character.x, character.y, target.x, target.y);

		//target position has changed
		//目标位置改变。（即目标发生了移动），角色要再靠近目标
		if (((dis1 * 3 > dis2) && (dis1 < distance)) || !blackboard.moved) {
			targetPos.x = target.x;
			targetPos.y = target.y;

			character.move(target.x, target.y, true, function(err, result) {
				if (err || result === false) {
					blackboard.moved = false;
					character.target = null;
				}else {
					character.setIsMoving(true);
				}
			});
		} else {
			// if(character.type === consts.EntityType.MOB){
			if (!character.isMoving)
				blackboard.moved = false;
			// }
		}
	}
	//角色有移动，doAction返回等待
	return bt.RES_WAIT;
};

module.exports.create = function() {
	return Action;
};
