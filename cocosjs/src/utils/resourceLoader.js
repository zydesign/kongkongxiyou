//require('src/utils/pool/objectPool.js');
//require('src/utils/pool/objectPoolFactory.js');

// var EventEmitter = window.EventEmitter;
// var pomelo = window.pomelo;
// var imgURL = 'http://pomelo.netease.com/art/';

function ResourceLoader() {
    // EventEmitter.call(this);

    this.totalCount = 0;
    this.loadedCount = 0;
}

ResourceLoader.prototype.loading = function(percent) {
    this.loadingLayer.setPercent(percent);
    this.loadingLayer.setString("加载中..." + percent + "%");
};

ResourceLoader.prototype.complete = function() {
    this.loadingLayer.setPercent(100);     //进度条节点满100%进度
    this.loadingLayer.setString("加载完成...100%");
    appHandler.resourceLoader = null;     //资源读取器值设置为null
};

ResourceLoader.prototype.loadAreaResource = function(loadingLayer) {
    var skinIds={};
    //先声明加载技能资源函数
    function addSkillRes(skillId){
        var skillEffect=dataApi.skill_effect.findById(skillId);
        if (skillEffect) {
            cb.EntitySprite.loadResById(skillEffect.aEffectId);
            cb.EntitySprite.loadResById(skillEffect.tEffectId);
            cb.EntitySprite.loadResById(skillEffect.bulletId);
        }
    };

    var allRoleDatas=dataApi.role.all();
    for (var key in allRoleDatas) {
        var roleData=allRoleDatas[key];
        // cb.EntitySprite.loadResById(roleData.id);
        var character = dataApi.character.findById(roleData.id);
        
        //通过角色皮肤id加载精灵图片资源
        cb.EntitySprite.loadResById(character.skinId);
        
        //加载技能资源
        addSkillRes(character.skillId);
        
        //加载怪物技能资源
        if (cc.isString(roleData.skillIds)) {
            roleData.skillIds = JSON.parse(roleData.skillIds)
        }
        for (var i = 0; i < roleData.skillIds.length; i++) {
            addSkillRes(roleData.skillIds[i]);
        }
    }

    var self=this;
    this.indexCount=0;
    this.isComplete=false;
    //定时0秒执行loading函数，直到次数为10时停止定时器，（实则是假进度，加载到100%后，只是等待切换areaScene）
    this.intervalId=setInterval(function() {
        self.indexCount++;
        //进度条大于9时，调用 appHandler.enterScene()函数，删除loading背景，设置app.setData，并area.enterScene进入场景
        if (self.indexCount>9) {
            clearInterval(self.intervalId);
            if (!self.isComplete) {
                self.isComplete=true;
                // self.complete();
                appHandler.enterScene();
            }
        }else{
            self.loading(self.indexCount*10);
        }
    },0);

    //这个loadingLayer由appHandler提供，引用于loadingScene._loadingLayer脚本函数
    this.loadingLayer=loadingLayer;
};
