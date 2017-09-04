var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var formula = require('../../consts/formula');
var consts = require('../../consts/consts');
var EntityType = consts.EntityType;
var ActionType = consts.ActionType;

//该节点用于拾取道具和与NPC对话
var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Move the character to the target.
 * 移动角色靠近目标
 * @return {Number} bt.RES_SUCCESS if the character already next to the target;
 *					bt.RES_WAIT if the character need to move to the target;
 *					bt.RES_FAIL if any fails
 */
pro.doAction = function() {
	var blackboard = this.blackboard;
	var character = blackboard.curCharacter;
	var targetId = blackboard.curTarget;
	var target = blackboard.area.getEntity(targetId);

	//如果目标不存在或消失
	if (!target || target.died) {
		// target has disappeared or died
		//如果目标消失，执行角色忘记仇恨函数，解除目标锁定，doAction返回失败
		character.forgetHater(targetId);
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	//如果目标不匹配角色目标
	if (targetId !== character.target) {
		//target has changed
		blackboard.curTarget = null;
		blackboard.distanceLimit = 0;
		blackboard.targetPos = null;
		blackboard.moved = false;
		return bt.RES_FAIL;
	}

	var distance = blackboard.distanceLimit || 200;
	//有目标，目标匹配角色目标，而且角色与目标的距离，在限制距离范围内，执行场景的timer的停止移动函数，doAction返回成功
	if (formula.inRange(character, target, distance)) {
		blackboard.area.timer.abortAction(ActionType.MOVE, character.entityId);
		blackboard.distanceLimit = 0;
		blackboard.moved = false;
		return bt.RES_SUCCESS;
	}

	//角色的类型为怪物
	if (character.type === EntityType.MOB) {
		//怪物坐标离怪物初始坐标超过500，就要放弃仇恨
		if (Math.abs(character.x - character.spawnX) > 500 ||
			Math.abs(character.y - character.spawnY) > 500) {
			//we move too far and it is time to turn back
			//怪物走的太远，执行放弃仇恨函数，doAction返回失败
			character.forgetHater(targetId);
			blackboard.moved = false;
			return bt.RES_FAIL;
		}
	}

	var targetPos = blackboard.targetPos;
	//如果黑板的moved为false，执行角色移动函数，角色的Moving改为true，黑板targetPos赋值，黑板的moved改为true
	if (!blackboard.moved) {
		character.move(target.x, target.y, true, function(err, result) {
			if (err || result === false) {
				blackboard.moved = false;
				character.target = null;
			} else {
				// if(character.type === consts.EntityType.MOB) {
					character.setIsMoving(true);
				// }
			}
		});

		blackboard.targetPos = {
			x: target.x,
			y: target.y
		};
		blackboard.moved = true;
		//如果目标坐标不存在而且目标不匹配，说明目标已经移动改变位置了
	} else if (targetPos && (targetPos.x !== target.x || targetPos.y !== target.y)) {
		//目标改变的距离
		var dis1 = formula.distance(targetPos.x, targetPos.y, target.x, target.y);
		//角色位置与目标最新坐标的距离
		var dis2 = formula.distance(character.x, character.y, target.x, target.y);

		//target position has changed
		//目标位置改变。（即目标发生了移动），，更新targetPos，角色要再靠近目标
		if (((dis1 * 3 > dis2) && (dis1 < distance)) || !blackboard.moved) {
			targetPos.x = target.x;
			targetPos.y = target.y;

			character.move(target.x, target.y, true, function(err, result) {
				if (err || result === false) {
					blackboard.moved = false;
					character.target = null;
				}
			});
		} else {
			// if(character.type === consts.EntityType.MOB){
			if (!character.isMoving)
				blackboard.moved = false;
			// }
		}
	}
	return bt.RES_WAIT;
};

module.exports.create = function() {
	return Action;
};
