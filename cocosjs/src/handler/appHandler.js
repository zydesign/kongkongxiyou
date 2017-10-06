var appHandler = {
	//进入场景。resourceLoader.loadAreaResource读取进度，进度条大于9时，执行enterScene函数
	enterScene: function() {
		cc.log("appHandler.enterScene==============>>");
		//删除loading背景
		cb.CommonLib.removeRes("uiimg/load_scene.png");
		cb.CommonLib.removeRes("uiimg/load_scene.png");
		app.init();
		//访问场景服务器，进入场景，返回code、areaId、角色信息、角色aoi灯塔附近的实体信息
		app.enterSceneReqId=pomelo.request("area.playerHandler.enterScene",{}, function(data) {
			//服务器返回信息后，资源读取器加载完成，显示100%加载完毕
			if (appHandler.resourceLoader) {
				appHandler.resourceLoader.complete();
			}
			if (data.code===200) {
			}else if (data.code === 201) {
				data.areaState=AreaStates.BATTLE_STATE;
			}else{
				tipsBoxLayer.showErrorCode(data.code);
				return;
			}
			//将服务器返回的data，10毫秒后存入app，并area.enterArea()
			setTimeout(function() {
    	 		app.setData(data);
    	 	},10);
			
		});
	},

	loadResource: function() {
		// if (appHandler.resourceLoader) {
		// 	cc.log("ERROR:forbind frequently enterScene");
		// 	return;
		// }

		cc.log("appHandler.loadResource==============>>");
		//读取资源之前要先清除面板及数据
		app.destroyAllData();
		
		//clientManager已经引入了LoadingScene脚本，所以这里可以直接new
		var loadingScene = new LoadingScene();
		var loadingLayer = loadingScene._loadingLayer;
		//切换场景到loadingScene，并使用这个场景，loading完成100%后，会new Area(data)实例场景，会切换到area场景
		cc.director.replaceScene(loadingScene);

		//资源读取器，clientManager已经引入了ResourceLoader脚本，所以这里可以直接new
		var resourceLoader = new ResourceLoader();
		appHandler.resourceLoader=resourceLoader;
		//资源读取器读取loadinglayer的资源，去调用appHandler.enterScene()进入场景
		resourceLoader.loadAreaResource(loadingLayer);
	},
};
