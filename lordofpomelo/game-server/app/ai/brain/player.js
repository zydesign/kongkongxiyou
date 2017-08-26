var TryAndAdjust = require('../node/tryAndAdjust');     //尝试调整节点
var TryAttack = require('../action/tryAttack');         //尝试攻击节点
var TryPick = require('../action/tryPick');             //尝试拾取节点
var TryTalkToNpc = require('../action/tryTalkToNpc');   //尝试与NPC对话节点
var MoveToTarget = require('../action/moveToTarget');   //移动到目标位置节点
var MoveToTargetForAttack = require('../action/moveToTargetForAttack');   //移动到目标位置并进行攻击节点

var bt = require('pomelo-bt');    //AI行为树模块
var Loop = bt.Loop;   //循环节点
var If = bt.If;       //if节点（带条件节点的系列节点）
var Select = bt.Select;  //选择节点
var consts = require('../../consts/consts');

/**
 * Auto fight brain.
 * Attack the target if have any.
 * Choose the 1st skill in fight skill list or normal attack by defaul.
 * 自动战斗大脑，如果有目标则发起攻击，选择第一个技能攻击或默认技能攻击
 */
var Brain = function(blackboard) {
	var attack = genAttackAction(blackboard);  //生成攻击行为
	var pick = genPickAction(blackboard);      //生成拾取行为
	var talkToNpc = genNpcAction(blackboard);  //生成NPC行为

	//实例一个选择节点
	var action = new Select({
		blackboard: blackboard
	});

	//添加选择行为的子行为
	action.addChild(attack);
	action.addChild(pick);
	action.addChild(talkToNpc);

	//composite them together
	this.action = action;
};

var pro = Brain.prototype;

//更新行为
pro.update = function() {
	return this.action.doAction();
};

//生成攻击动作节点
var genAttackAction = function(blackboard) {
	//try attack and move to target action
	
	//loopAttack循环节点的子节点：攻击节点attack    （尝试攻击并调整攻击）
	var attack = new TryAndAdjust({
		blackboard: blackboard, 
		//调整动作
		adjustAction: new MoveToTargetForAttack({
			blackboard: blackboard
		}), 
		//尝试攻击
		tryAction: new TryAttack({
			blackboard: blackboard 
			// getSkillId: function(bb) {
			// 	//return current skill or normal attack by default
			// 	return bb.curCharacter.curSkill || bb.curCharacter.normalSkill;
			// }
		})
	});

	//loop attack action 
	//loopAttack循环节点的条件：循环条件 （如果没有切换目标，攻击是同一个，循环条件为true，如果切换了，为false）
	//参数bb就是blackboard，因为在loop节点里循环条件call了这个参数进去this.loopCond.call(null, this.blackboard)
	var checkTarget = function(bb) {
		//如果当前要锁定的目标跟之前不同，则不锁定任何目标，值为null
		//bb.curTarget会在haveTarget赋值
		if(bb.curTarget !== bb.curCharacter.target) {
			// target has change 目标已改变
			bb.curTarget = null;
			return false;
		}

		return !!bb.curTarget;
	};

	//另一个节点loopAttack为循环节点loop（带循环条件的包装节点）
	var loopAttack = new Loop({
		blackboard: blackboard, 
		child: attack,  //包装节点的子节点
		loopCond: checkTarget  //循环条件
	});

	//if have target then loop attack action
	//如果有目标，则循环攻击
	var haveTarget = function(bb) {
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);

		//如果目标丢失，当前目标变null，条件返回false
		if(!target) {
			// target has disappeared
			character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}

		//如果目标类型为怪物或玩家，当前目标添加targetId，条件返回true
		if(target.type === consts.EntityType.MOB || 
			target.type === consts.EntityType.PLAYER) {
			bb.curTarget = targetId;
			return true;
		}
		//如果目标不是怪物或玩家，而是npc，条件返回false
		return false;
	};

	//攻击节点最后生成的是if节点（带条件节点的Sequence序列节点）
	return new If({
		blackboard: blackboard, 
		cond: haveTarget,   //用于生成条件节点condition
		action: loopAttack  //另外一个子节点
	});
};

var genPickAction = function(blackboard) {
	//try pick and move to target action
	var pick = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new MoveToTarget({
			blackboard: blackboard
		}), 
		tryAction: new TryPick({
			blackboard: blackboard 
		})
	});

	//if have target then pick it
	var haveTarget = function(bb) {
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);

		if(!target) {
			// target has disappeared
			// character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}

		if(consts.isPickable(target)) {
			bb.curTarget = targetId;
			return true;
		}
		return false;
	};

	return new If({
		blackboard: blackboard, 
		cond: haveTarget, 
		action: pick
	});
};

var genNpcAction = function(blackboard) {
	//try talk and move to target action
	var pick = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new MoveToTarget({
			blackboard: blackboard
		}), 
		tryAction: new TryTalkToNpc({
			blackboard: blackboard 
		})
	});

	//if have target then pick it
	var haveTarget = function(bb) {
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);

		if(!target) {
			// target has disappeared
			// character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}

		if(target.type === consts.EntityType.NPC) {
			bb.curTarget = targetId;
			return true;
		}
		return false;
	};

	return new If({
		blackboard: blackboard, 
		cond: haveTarget, 
		action: pick
	});
};

module.exports.clone = function(opts) {
	return new Brain(opts.blackboard);
};

module.exports.name = 'player';
