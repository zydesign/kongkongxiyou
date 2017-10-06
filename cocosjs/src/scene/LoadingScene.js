
//加载场景层（loading层）
var LoadingLayer = BaseSceneLayer.extend({
    _ccsNode:null,
    ctor:function () {
        this._super();
        //创建loading节点
        this.createCCSNode("uiccs/LoadingLayer.csb");

        var ccsNode=this._ccsNode;

        //设置进度条节点图片
        this.loadingBar=ccsNode.getChildByName("loadingBar");
        this.loadingText=ccsNode.getChildByName("loadingText");

        cc.log("LoadingLayer =======>>");
    },
    setPercent:function(percent){
        this.loadingBar.setPercent(percent);
    },

    setString:function(loadingTips){
        this.loadingText.setString(loadingTips);
    },


});

//loading场景类。【main脚本new LoginScene()是调用这里】
var LoadingScene = cc.Scene.extend({
    _loadingLayer:null,
    ctor:function () {
        this._super();
        this._loadingLayer = new LoadingLayer();
        this.addChild(this._loadingLayer);

        this.setTag(16883);

        // this.setVisible(false);
    }
});

