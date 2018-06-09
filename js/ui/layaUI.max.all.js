var CLASS$=Laya.class;
var STATICATTR$=Laya.static;
var View=laya.ui.View;
var Dialog=laya.ui.Dialog;
var BeginUI=(function(_super){
		function BeginUI(){
			
		    this.gameStart=null;
		    this.input_n=null;

			BeginUI.__super.call(this);
		}

		CLASS$(BeginUI,'ui.BeginUI',_super);
		var __proto__=BeginUI.prototype;
		__proto__.createChildren=function(){
		    
			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(BeginUI.uiView);

		}

		BeginUI.uiView={"type":"View","props":{"width":800,"height":600},"child":[{"type":"Image","props":{"y":179,"x":150,"width":500,"skin":"template/Text/TextBox.png","sizeGrid":"4,3,3,3","height":55}},{"type":"Button","props":{"y":285,"x":332,"width":136,"var":"gameStart","skin":"comp/button.png","sizeGrid":"4,3,3,3","labelSize":16,"labelBold":true,"label":"开始游戏","height":38}},{"type":"TextInput","props":{"y":190,"x":192,"width":416,"var":"input_n","text":"请输入多边形边数","height":34,"fontSize":18,"align":"center"}}]};
		return BeginUI;
	})(View);
var EndUI=(function(_super){
		function EndUI(){
			
		    this.score=null;
		    this.bestScore=null;

			EndUI.__super.call(this);
		}

		CLASS$(EndUI,'ui.EndUI',_super);
		var __proto__=EndUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(EndUI.uiView);

		}

		EndUI.uiView={"type":"View","props":{"width":800,"height":600},"child":[{"type":"Text","props":{"y":10,"x":251,"width":298,"var":"score","text":"你的得分：","height":30,"fontSize":20,"color":"#333333","align":"center"}},{"type":"Text","props":{"y":237,"x":232,"width":335,"var":"bestScore","height":38,"fontSize":24,"color":"#666666","bold":true,"align":"center"}}]};
		return EndUI;
	})(View);
var GameUI=(function(_super){
		function GameUI(){
			
		    this.score=null;

			GameUI.__super.call(this);
		}

		CLASS$(GameUI,'ui.GameUI',_super);
		var __proto__=GameUI.prototype;
		__proto__.createChildren=function(){
		    			View.regComponent("Text",laya.display.Text);

			laya.ui.Component.prototype.createChildren.call(this);
			this.createView(GameUI.uiView);

		}

		GameUI.uiView={"type":"View","props":{"width":800,"height":600},"child":[{"type":"Text","props":{"y":230,"x":235,"width":329,"var":"score","height":28,"fontSize":24,"font":"Arial","color":"#666666","bold":true,"align":"center"}}]};
		return GameUI;
	})(View);