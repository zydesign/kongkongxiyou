var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var Pick=consts.Pick
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
 * Try to invoke the pick the item.
 * 
 * @return {Number} bt.RES_SUCCESS if success to pick the item;
 *					bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the item distance.
 */
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;
	//黑板的curTarget由player大脑的haveTarget赋值
	var targetId = blackboard.curTarget;
	var area = blackboard.area;

	var target = area.getEntity(targetId);

	//如果目标不存在，初始化当前目标，角色目标；doAction返回结果失败
	if(!target) {
		// target has disappeared
		
		blackboard.curTarget = null;
		if(targetId === character.target) {
			character.target = null;
		}
		return bt.RES_FAIL;
	}

	//当前目标与角色目标不匹配，目标类型即不是物品也不是装备的话，要初始化当前目标，doAction结果返回失败
	if(targetId !== character.target 
		|| (target.type !==EntityType.ITEM 
			&& target.type !==EntityType.EQUIPMENT)) {
		// if target changed or is not pickable
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}

	//如果目标存在，而且匹配角色目标，而且是道具，执行角色拾取函数
	var res = character.pickItem(target.entityId);
	//判断拾取结果：成功、物品消失，背包满，则初始化当前目标，角色目标，doAction结果返回成功
	if(res === Pick.SUCCESS  
		|| res === Pick.VANISH 
		|| res === Pick.BAG_FULL
		) {
		blackboard.curTarget = null;
		character.target = null;
		return bt.RES_SUCCESS;
	}

	//如果拾取结果不在拾取范围内，初始化一次黑板拾取距离赋值100，doAction结果返回失败
	if(res === Pick.NOT_IN_RANGE) {
		blackboard.distanceLimit = 100;
	}
	
	return bt.RES_FAIL;
};
