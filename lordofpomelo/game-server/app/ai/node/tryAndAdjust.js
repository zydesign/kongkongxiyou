var bt = require('pomelo-bt');
var BTNode = bt.Node;
var Sequence = bt.Sequence;
var Select = bt.Select;
var util = require('util');

/**
 * Try and adjust action.  尝试并调整动作
 * Try to do a action and return success if the action success.
 * 尝试发起一个动作，如果动作成功，返回成功
 * If fail then do the adjustment and try it again when adjust return success.
 * 如果动作失败，则调整，并在调整后再攻击
 *
 * @param opts {Object} 
 *				opts.blackboard {Object} blackboard
 *				opts.adjustAction {BTNode} adjust action
 *				opts.tryAction {BTNode} try action}
 */
var Node = function(opts) {
	BTNode.call(this, opts.blackboard);

	//创建一个序列节点（//调整再次攻击），并增加子节点
	var adjustAndTryAgain = new Sequence(opts);
	adjustAndTryAgain.addChild(opts.adjustAction);  //调整动作
	adjustAndTryAgain.addChild(opts.tryAction);     //尝试攻击

	//创建一个选择节点（攻击-调整再攻击），并增加子节点
	var tryAndAdjust = new Select(opts);
	tryAndAdjust.addChild(opts.tryAction);     //尝试攻击
	tryAndAdjust.addChild(adjustAndTryAgain);  //调整再次攻击

	this.action = tryAndAdjust;
};
util.inherits(Node, BTNode);

module.exports = Node;

var pro = Node.prototype;

pro.doAction = function() {
	return this.action.doAction();
};
