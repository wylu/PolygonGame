/**Created by the LayaAirIDE*/
	var Begin=(function(_super){
		function Begin(){
			Begin.__super.call(this);
			this.input_n.restrict = "0-9";
			this.gameStart.on(Laya.Event.CLICK,this,this.onStartGame);
		}

		Laya.class(Begin,'view.Begin',_super);

		var _proto = Begin.prototype;
		_proto.onStartGame = function(){
			if(this.input_n.text == "" || this.input_n.text == "请输入多边形边数"){
				alert("请输入多边形边数!");
				return;
			}
			if(this.input_n.text < 3 || this.input_n.text > 25){
				alert("多边形的边数取值范围为[3, 25]");
			}else{
				//启动游戏
				this.removeSelf();
				//第一个参数n为多边形边数，第二个外接圆半径，第三第四顶点值最大最小
				LayaMain.game = new Game(this.input_n.text,250,-10,10);
				Laya.stage.addChild(LayaMain.game);
			}
		}
		return Begin;
	})(BeginUI)