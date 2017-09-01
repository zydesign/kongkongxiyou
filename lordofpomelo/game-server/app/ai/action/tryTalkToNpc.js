var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var NPC=consts.NPC;
/**
 * Try pick action.
 * 
 * @param opts {Object} {blackboard: blackboard}
 */
var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Try to invoke the talk to npc action.
 * 
 * @return {Number} bt.RES_SUCCESS if success to talk to npc;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the npc distance.
 */
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	////黑板的curTarget由player大脑的haveTarget赋值
	var targetId = blackboard.curTarget;
	var area = blackboard.area;

	var target = area.getEntity(targetId);

	if(!target) {
		// if target has disappeared
		blackboard.curTarget = null;
		if(targetId === character.target) {
			character.target = null;
		}
		return bt.RES_FAIL;
	}

	if(target.type !==EntityType.NPC) {
		// target has changed
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	//满足NPC交谈条件，执行交谈函数，判断执行结果如果成功，doAction返回成功
	var result = target.talk(character);
	if(result === NPC.SUCCESS) {
		blackboard.curTarget = null;
		character.target = null;
		return bt.RES_SUCCESS;
	}
	if(result === NPC.NOT_IN_RANGE) {
		blackboard.distanceLimit = 250;
	}
	
	return bt.RES_FAIL;
};
