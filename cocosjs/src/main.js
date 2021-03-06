//这个脚本是cc.game的方法，游戏加载前必运行

cc.game.onStart = function() {
  //    cc.view.enableRetina(false);
  //    cc.view.adjustViewPort(true);
  //    cc.view.setDesignResolutionSize(960, 640, cc.ResolutionPolicy.NO_BORDER);
  cc.view._setDesignResolutionSize(960, 640, cc.ResolutionPolicy.NO_BORDER);
  cc.winSize = cc.director.getWinSize();
  //    cc.view.resizeWithBrowserSize(true);
  // cc.LoaderScene.preload([], function() {

  // if (true) {
  //   require('src/scene/BaseSceneLayer.js');
  //   require('src/manager/clientManager.js');
  //   require('src/scene/SelectScene.js');
  //   require('src/scene/LoadingScene.js');
  //   require('src/scene/AreaScene.js');
  //   require('editor/src/app.js');
  //   return;
  // }

  require('src/ui/TipsBoxLayer.js');
  require('src/scene/BaseSceneLayer.js');
  require('src/manager/clientManager.js');

  // var gameRun = function(loginInfo) {
  //   var runStepKey = sys.localStorage.getItem("kRunStepKey");
  //   if (runStepKey) {
      // clientManager.login(loginInfo);
  //   } else {
  //     require('src/scene/FirstRunScene.js');
  //     var firstRunScene = new cb.FirstRunScene();
  //     cc.director.replaceScene(firstRunScene);
  //     firstRunScene.addEventListener(function() {
  //       clientManager.login(loginInfo);
  //     });
  //   }
  // };

  var sdkManager = cb.SDKManager.getInstance();
  // sdkManager.addEventListener(function(msgType, param1) {
  //   //kMSDKStateLoginSuccess=1
  //   if (msgType === 1) {
  //     var loginInfo = {
  //       username: sdkManager.getUserName(),
  //       password: sdkManager.getPassword(),
  //       channelId: sdkManager.getChannelId(),
  //       deviceModel: sdkManager.getDeviceModel()
  //     }
  //     gameRun(loginInfo);
  //   }
  // });
  // sdkManager.sdkLogin();

  // if (cc.sys.os == cc.sys.OS_OSX) {
    var userName = sys.localStorage.getItem("userName");
    if (!userName) {
      userName=Date.now()+Math.floor(Math.random()*1000);
      sys.localStorage.setItem("userName",userName);
    }
     // || "linyou";
    var password = sys.localStorage.getItem("password")
    if (!password) {
      password=Date.now()+Math.floor(Math.random()*1000);
      sys.localStorage.setItem("password",password);
    }
    var loginInfo = {
      username: userName,
      password: password,
      channelId: sdkManager.getChannelId(),
      deviceModel: sdkManager.getDeviceModel()
    }
    
    //客户端管理器执行登录函数
    clientManager.login(loginInfo);
    // gameRun(loginInfo);
  // }

  // require('src/scene/LoginScene.js');
  // var loginScene = new LoginScene();
  // cc.director.replaceScene(loginScene);
  // loginScene.addEventListener(function(username, password) {
  //   gameRun(username, password);
  // });

  // runStepKey=false;
  // if (runStepKey) {
  //     gameRun();
  // } else {
  //     require('src/scene/FirstRunScene.js');
  //     var firstRunScene = new cb.FirstRunScene();
  //     cc.director.replaceScene(firstRunScene);
  //     firstRunScene.addEventListener(function() {
  //         gameRun();
  //     });
  // }
};

//执行运行游戏
cc.game.run();
