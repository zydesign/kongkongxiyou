var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');
// var consts = require('../../consts/consts');
var EntityType = require('../../consts/consts').EntityType;
var AttackResult=require('../../consts/consts').AttackResult;
/**
 * Try attack action.
 * 尝试攻击节点，带有doAction
 * @param opts {Object} {blackboard: blackboard, getSkillId: get skill id cb}
 */
var Action = function(opts) {
	//继承根节点，目的获取黑板属性，技能id
	BTNode.call(this, opts.blackboard);
	this.getSkillId = opts.getSkillId;
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Try to invoke the attack skill that returned by getSkillId callback.
 *
 * @return {Number} 
 * bt.RES_SUCCESS if success to invoke the skill;
 * bt.RES_FAIL if any fails and set distanceLimit to blackboard stands for beyond the skill distance.
 */
//判断当前技能.curSkill是否存在；判断当前目标curTarget是否存在；判断当前目标curTarget是否匹配角色锁定的目标target
pro.doAction = function() {
	var blackboard=this.blackboard;
	var character = blackboard.curCharacter;

	// console.log("AI tryAttack=============>>"+character.characterData.name);

	//如果当期角色获取不到当前技能，返回失败
	if(!character.curSkill){
		// console.log("AI tryAttack=============>> !curSkill");
		return bt.RES_FAIL;
	}

	// 当前锁定的目标id，是从黑板中获取
	// ps：blackboard.curTarget是由大脑player脚本的haveTarget赋值的，其if节点先条件赋值，再执行攻击节点
	var targetId = blackboard.curTarget;
	//通过目标id，使用场景获取目标实体
	var target = blackboard.area.getEntity(targetId);

	//如果获取不到target，或者target死亡
	if(!target || target.died) {
		// console.log("AI tryAttack=============>> !target");
		// target has disappeared or died
		//如果目标消失或死亡，黑板的当前目标改为null，角色解除锁定目标
		blackboard.curTarget = null;
		// if(targetId === character.target) {
		character.forgetHater(targetId);
		// }
		return bt.RES_FAIL;
	}

	//判断当前目标是否匹配角色锁定的目标
	if(targetId !== character.target) {
		// console.log("AI tryAttack=============>>target change");
		//if target change abort current attack and try next action
		//如果目标改变，停止当前攻击，尝试下一个攻击
		//targetId为最新锁定的id，character.target为之前锁定的id，所以攻击目标改变了，攻击停止
		blackboard.curTarget = null;
		return bt.RES_FAIL;
	}
	// if(target.type !== EntityType.MOB &&
	// 	target.type !== EntityType.PLAYER){
	// 	return bt.RES_FAIL;
	// }
	
	//这里执行攻击动作函数
	var result = character.attack(target,character.curSkill);
	
	//如果打出了攻击或打出了miss，就算攻击成功，否则还是失败
	if(result === AttackResult.SUCCESS
		|| result === AttackResult.MISS 
		) {
		return bt.RES_SUCCESS;
	}
	// if(res.result === AttackResult.NOT_IN_RANGE) {
	// 	this.blackboard.distanceLimit = res.distance;
	// }
	return bt.RES_FAIL;
};
