var bt = require('pomelo-bt');

var Action = function(opts) {
	this.blackboard = opts.blackboard;
};

module.exports = Action;

var pro = Action.prototype;

/**
 * Find the near by player and hates the player.
 * 找到附近玩家并锁定目标
 * 
 * @return {Number} bt.RES_SUCCESS if find a player and hates him;
 *					bt.RES_FAIL if no player nearby.
 */
pro.doAction = function() {
	var character = this.blackboard.curCharacter;
	if(character.target || character.haters.length) {
		//have a target already
		//已经有锁定目标
		return bt.RES_SUCCESS;
	}
 
	var area = this.blackboard.area;
	//TODO: remove magic range: 300
	//自身300范围内搜索玩家
	var players = area.getEntitiesByPos({x: character.x, y: character.y}, [EntityType.PLAYER], 300); 
	if(players && players.length) {
		//TODO: remove magic hate point: 5
		// 增加5点仇恨
		character.increaseHateFor(players[0].enitityId, 5);
		return bt.RES_SUCCESS;
	}
	//TODO: implements reset logic
	return bt.RES_FAIL;
};

module.exports.create = function() {
	return Action;
};
