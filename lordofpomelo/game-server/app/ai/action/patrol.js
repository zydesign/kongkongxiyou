var bt = require('pomelo-bt');
var BTNode = bt.Node;
var util = require('util');

var Action = function(opts) {
	BTNode.call(this, opts.blackboard);
};
util.inherits(Action, BTNode);

module.exports = Action;

var pro = Action.prototype;

/**
 * Move the current mob into patrol module and remove it from ai module.
 * 将当前怪物已入巡逻模块，并从ai模块中移除
 * @return {Number} bt.RES_SUCCESS if everything ok;
 *					bt.RES_FAIL if any error.
 */
pro.doAction = function() {
	var character = this.blackboard.curCharacter;
	var area = this.blackboard.area;
	// console.log("AI Patrol=============>>"+character.characterData.name);

	//场景执行巡逻函数
	area.timer.patrol(character.entityId);
	return bt.RES_SUCCESS;
};

module.exports.create = function() {
	return Action;
};
