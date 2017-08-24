var Service = function() {
	this.brains = {};
};

module.exports = Service;

var pro = Service.prototype;

//大脑服务可以获取大脑和注册大脑
pro.getBrain = function(type, blackboard) {
	// TODO: mock data
	// 如果类型既不是autoFight，也不是player，才会执行type = 'tiger'
	if(type !== 'autoFight' && type !== 'player') {
		type = 'tiger';
	}
	var brain = this.brains[type];
	if(brain) {
		return brain.clone({blackboard: blackboard});
	}
	return null;
};

//注册大脑，将一个大脑加入到大脑管理器
pro.registerBrain = function(type, brain) {
	this.brains[type] = brain;
};

