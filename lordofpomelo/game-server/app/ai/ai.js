var AiManager = require('./service/aiManager');
var BrainService = require('./service/brainService');
var fs = require('fs');
var path = require('path');

var exp = module.exports;
//此脚本只要由area脚本引用，并创建AiManager

//创建一个AiManager实例，主要是给参数添加大脑服务brainService属性，注册大脑到brainService
exp.createManager = function(opts) {
	var brainService = new BrainService();
	// 遍历brain目录下的所有脚本
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
	//给参数添加属性，大脑服务
	opts.brainService = brainService;
	return new AiManager(opts);
};
