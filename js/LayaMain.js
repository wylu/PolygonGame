(function(){
    (function(LayaMain){
        //初始化引擎
        Laya.init(800,600);
        Laya.stage.scaleMode = Laya.Stage.SCALE_NOSCALE;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        //设置舞台颜色
        Laya.stage.bgColor = "#ffffff";
        //加载资源
        Laya.loader.load("res/atlas/comp.atlas",Laya.Handler.create(this,onLoaded),null,Laya.Loader.ATLAS)
    })();

    function onLoaded(){
        var begin = new Begin();
        Laya.stage.addChild(begin);
    }
})(window.LayaMain || (window.LayaMain = {}));