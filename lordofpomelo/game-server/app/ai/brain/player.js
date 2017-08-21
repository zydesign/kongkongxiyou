var TryAndAdjust = require('../node/tryAndAdjust');     //尝试调整
var TryAttack = require('../action/tryAttack');         //尝试攻击
var TryPick = require('../action/tryPick');             //尝试拾取
var TryTalkToNpc = require('../action/tryTalkToNpc');   //尝试与NPC对话
var MoveToTarget = require('../action/moveToTarget');   //移动到目标位置
var MoveToTargetForAttack = require('../action/moveToTargetForAttack');   //移动到目标位置并进行攻击

var bt = require('pomelo-bt');    //AI所依赖的行为树
var Loop = bt.Loop;   //行为树的循环节点
var If = bt.If;       //行为树的条件函数
var Select = bt.Select;  //行为树的选择函数
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

	//实例一个选择行为
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

//生成攻击行为
var genAttackAction = function(blackboard) {
	//try attack and move to target action
	var attack = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new MoveToTargetForAttack({
			blackboard: blackboard
		}), 
		tryAction: new TryAttack({
			blackboard: blackboard 
			// getSkillId: function(bb) {
			// 	//return current skill or normal attack by default
			// 	return bb.curCharacter.curSkill || bb.curCharacter.normalSkill;
			// }
		})
	});

	//loop attack action
	var checkTarget = function(bb) {
		if(bb.curTarget !== bb.curCharacter.target) {
			// target has change
			bb.curTarget = null;
			return false;
		}

		return !!bb.curTarget;
	};

	var loopAttack = new Loop({
		blackboard: blackboard, 
		child: attack, 
		loopCond: checkTarget
	});

	//if have target then loop attack action
	var haveTarget = function(bb) {
		var character = bb.curCharacter;
		var targetId = character.target;
		var target = bb.area.getEntity(targetId);

		if(!target) {
			// target has disappeared
			character.forgetHater(targetId);
			bb.curTarget = null;
			return false;
		}

		if(target.type === consts.EntityType.MOB || 
			target.type === consts.EntityType.PLAYER) {
			bb.curTarget = targetId;
			return true;
		}
		return false;
	};

	return new If({
		blackboard: blackboard, 
		cond: haveTarget, 
		action: loopAttack
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
