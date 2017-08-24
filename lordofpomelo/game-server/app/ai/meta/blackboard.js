//黑板的属性管理、场景、当前角色
//要通过blackboard.create（）实例黑板才能使用

var Blackboard = function(opts) {
	this.manager = opts.manager;
	this.area = opts.area;
	this.curCharacter = opts.curCharacter;
};

var pro = Blackboard.prototype;

module.exports.create = function(opts) {
	return new Blackboard(opts);
};
