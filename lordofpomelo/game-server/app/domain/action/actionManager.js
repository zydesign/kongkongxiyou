// var Queue = require('pomelo-collection').queue;  //这里舍弃使用队列模块
var logger = require('pomelo-logger').getLogger(__filename);
var ActionType = require('../../consts/consts').ActionType;  //动作类型编入常量

/**
 * Action Manager, which is used to contrll all action
 * 动作管理器，用来控制所有动作
 */

//在area类引入actionManager作为属性，提供opt参数
var ActionManager = function(opts){
	this.actionMap = {};
	this.actionArray=[];
}; 

/**
 * Add action 
 * @param {Object} action  The action to add, the order will be preserved
 * 增加并储存动作
 */
ActionManager.prototype.addAction = function(action){
	//如果动作是独立的，先停止这个动作
	if(action.singleton) {
		this.abortAction(action.type, action.id);
	}
	//获取动作图阵，类型组
	var actions=this.actionMap[action.type];
	//获取不到动作组，则新建一个组
	if (!actions) {
		actions={};
		this.actionMap[action.type]=actions;
	}
	actions[action.id] = action;
	this.actionArray.push(action);
	return true;
};

/**
 * abort an action, the action will be canceled and not excute
 * @param {String} type Given type of the action
 * @param {String} id The action id
 */
ActionManager.prototype.abortAction = function(type, id){
	var actions=this.actionMap[type];
	if(!actions || !actions[id]){
		return;
	}
	if(type===ActionType.MOVE){
		actions[id].stopMove();
	}
	actions[id].aborted = true;
	delete actions[id];
};

/**
 * Abort all action by given id, it will find all action type
 * 根据给定的id终止所有动作，它会找到所有的动作类型
 */
ActionManager.prototype.abortAllAction = function(id){
	var actionMap=this.actionMap;
	for(var type in actionMap){
		if(actionMap[type][id]) {
			actionMap[type][id].aborted = true;
			delete actionMap[type][id];
		}
	}
};

/**
 * Update all action
 * @api public
 */
ActionManager.prototype.update = function(currentTime){
	var action,actionArray=this.actionArray;
	var length=actionArray.length;
	for (var i = 0; i < length; i++) {
		//shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。这样就不需要Queue模块了，后面加入的动作都在最后
		action=actionArray.shift();
		if (!action || action.aborted) {
			continue;
		}
		action.update(currentTime);
		if(!action.finished){
			actionArray.push(action);
		}else{
			delete this.actionMap[action.type][action.id];
		}
	}
};	

module.exports = ActionManager;
