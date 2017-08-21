var AiManager = require('./service/aiManager');
var BrainService = require('./service/brainService');
var fs = require('fs');
var path = require('path');

var exp = module.exports;

//创建一个ai管理实例
exp.createManager = function(opts) {
	var brainService = new BrainService();
	fs.readdirSync(__dirname + '/brain').forEach(function(filename){
		//解析：/.../x,表示x文件夹里，查找某文件，反斜杠\表示查找内容
		//这里是在test文件夹里面查找带js脚本的文件
		if (!/\.js$/.test(filename)) {
			return;
		}
		var name = path.basename(filename, '.js');
		var brain = require('./brain/' + name);
		brainService.registerBrain(brain.name||name, brain);
	});

	opts = opts || {};
	//引入智慧服务
	opts.brainService = brainService;
	return new AiManager(opts);
};
