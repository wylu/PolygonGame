/**Created by the LayaAirIDE*/
var End=(function(_super){
	function End(originGameState, RADIUS, score){
		End.__super.call(this);
		this.score.text += score;

		//上一步
		Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createPreStepBtn));
		//下一步
		Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createNextStepBtn));
		//新游戏按钮
		Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createNewGameBtn));

		//记录游戏状态
		this.stepPaths = [];
		this.stepPaths[0] = originGameState;

		//设置多边形的边数
		this.n = originGameState.n;
		this.N = originGameState.n;
		//多边形顶点的整数值
		this.verticeNums = originGameState.verticeNums.slice();
		//多边形的边符号
		this.sideNums = originGameState.sideNums.slice();
		//设置固定的多边形参数--外切圆半径
		this.RADIUS = RADIUS;
		//游戏步骤
		this.step = 0;

		this.cX = this.RADIUS;//多边形中点x位置
		this.cY = this.RADIUS;//多边形中点y位置

		//消除矢量绘制的锯齿，但会增加性能消耗
       	Laya.Config.isAntialias = true;
		//设置绘制多边形的canvas
		this.canvas = new Laya.Sprite();
		//canvas大小为外切半径的两倍组成的正方形
		this.canvas.size(this.RADIUS*2, this.RADIUS*2);
		this.canvas.x = (Laya.stage.width - this.RADIUS*2) / 2;
		this.canvas.y = (Laya.stage.height - this.RADIUS*2) / 2;
		//添加到舞台
       	Laya.stage.addChild(this.canvas);

		//顶点的文本
		this.vertices = [];
		for(var i=0;i<this.n;i++){
			this.vertices[i] = new Laya.Text();
			Laya.stage.addChild(this.vertices[i]);
		}
		//多边形的边中点符号文本
		this.sideCenters = [];
		for(var i=0;i<this.n;i++){
			this.sideCenters[i] = new Laya.Text();
			Laya.stage.addChild(this.sideCenters[i]);
		}
		//多边形点的位置,存储在path中
		this.path = originGameState.path.slice();
		this.drawSomething(this.path);

		this.polygonAgent = new PolygonGame(originGameState.n, originGameState.sideNums, originGameState.verticeNums);
		this.polygonAgent.showPolygon();
		//最优合并顺序
		this.bestMergeStack = this.polygonAgent.polyMax().slice();
		console.log("BestScore: ", this.polygonAgent.bestScore);
		console.log("bestMergeStack: ", this.bestMergeStack);
		//用另外一个栈保存bestMesgeStack弹出的元素
		this.binStack = new Array();
	}

	Laya.class(End,'view.End',_super);
	var _proto = End.prototype;

	//设置preStepBtn按钮参数
	_proto.createPreStepBtn = function(){
		this.preStepBtn = new Laya.Button("res/ui/button.png","上一步");
		Laya.stage.addChild(this.preStepBtn);
		this.preStepBtn.width = 80;
		this.preStepBtn.height = 30;
		this.preStepBtn.pos(640, 1);
		this.preStepBtn.on(Laya.Event.CLICK, this, this.preStep);
	}

	//设置nextStepBtn按钮参数
	_proto.createNextStepBtn = function(){
		this.nextStepBtn = new Laya.Button("res/ui/button.png","下一步");
		Laya.stage.addChild(this.nextStepBtn);
		this.nextStepBtn.width = 80;
		this.nextStepBtn.height = 30;
		this.nextStepBtn.pos(720, 1);
		this.nextStepBtn.on(Laya.Event.CLICK, this, this.nextStep);
	}

	//设置NewGame按钮参数
	_proto.createNewGameBtn = function(){
		this.newGameBtn = new Laya.Button("res/ui/button.png","NewGame");
		Laya.stage.addChild(this.newGameBtn);
		this.newGameBtn.width = 80;
		this.newGameBtn.height = 30;
		this.newGameBtn.pos(1, 1);
		this.newGameBtn.on(Laya.Event.CLICK, this, this.newGame);
	}

	/**
	 * preStepBtn点击事件
	 */
	_proto.preStep = function(){
		if(this.step >= 1){
			this.bestScore.text = "";
			if(!Laya.stage.contains(this.vertices[0])) Laya.stage.addChild(this.vertices[0]);
			this.verticeNums = this.stepPaths[this.step].verticeNums;
			this.sideNums = this.stepPaths[this.step].sideNums;
			this.path = this.stepPaths[this.step].path;
			this.n = this.stepPaths[this.step].n;
			this.step -= 1;
			
			//恢复要合并的边
			var a = this.binStack.pop();
			if(this.binStack.length != 0){
				//恢复第a条边后，更新栈中边的下标，比如恢复第2条边后，原本的第2条边就变成了第3条边
				for(var i=0; i<this.bestMergeStack.length; i++){
					if(this.bestMergeStack[i] >= a) this.bestMergeStack[i]++;
				}
			}
			this.bestMergeStack.push(a);

			this.drawSomething(this.path);
		}
	}

	/**
	 * nextStepBtn点击事件
	 */
	_proto.nextStep = function(){
		this.step += 1;
		if(this.step > this.N){
			this.step--;
			return;
		}
		//保存游戏状态，用于返回上一步
		this.stepPaths[this.step] = new GameState(this.n,this.path,this.verticeNums,this.sideNums);

		//取出要合并的边
		var a = this.bestMergeStack.pop();
		//同时将取出的边压入另一个栈保存
		this.binStack.push(a);

		if(this.step == 1){
			this.sideNums[a] = 2;
		}else if(this.step<=this.N){
			var next = (a == this.n-1) ? 0 : a+1;
			//计算新点的值
			if(this.sideNums[a] == 0) this.verticeNums[next] += this.verticeNums[a];
			else this.verticeNums[next] *= this.verticeNums[a];
			//移除第a条边的坐标（0开始计数）
			this.path.splice(a, 1); 
			//除去第a个点
			this.verticeNums.splice(a, 1); 
			//除去第a条边
			this.sideNums.splice(a,1);
			//取出第a条边后，更新栈中边的下标，比如删除第2条边后，原本的第3条边就变成了第2条边
			for(var i=0; i<this.bestMergeStack.length; i++){
				if(this.bestMergeStack[i] > a) this.bestMergeStack[i]--;
			}
			//顶点数减一
			this.n = this.n-1;
		}
		this.drawSomething(this.path);
		if(this.step == this.N){
			this.canvas.graphics.clear();
			Laya.stage.removeChild(this.vertices[0]);
			this.bestScore.text = "最高得分: " + this.polygonAgent.bestScore;
		}
	}

	/**
	 * newGameBtn点击事件
	 */
	_proto.newGame = function(){
		this.removeSelf();
		this.canvas.destroy();
		//清理顶点数值和边中心符号
		for(var i=0;i<this.N;i++){
			this.vertices[i].destroy();
			this.sideCenters[i].destroy();
		}
		LayaMain.begin = new Begin();
		this.newGameBtn.destroy();
		this.preStepBtn.destroy();
		this.nextStepBtn.destroy();
		Laya.stage.addChild(LayaMain.begin);
	}

	/**
	 * 画多边形
	 */
	_proto.drawSomething = function(path){
		//清理画板
		this.canvas.graphics.clear();
		//清理顶点数值和边符号
		for(var i=0;i<this.N;i++){
			this.vertices[i].text = "";
			this.sideCenters[i].text = "";
		}
		var next, ecX, ecY;
		//画多边形 
		for(var i=0;i<this.n;i++){
			(i == this.n-1) ? next=0 : next=i+1;
			ecX = (path[i][0] + path[next][0]) / 2;
			ecY = (path[i][1] + path[next][1]) / 2;
			this.sideCenters[i].pos(this.canvas.x + ecX, this.canvas.y + ecY);
			if(this.sideNums[i]==0){//0是加
				this.canvas.graphics.drawLine(path[i][0],path[i][1], path[next][0],path[next][1], "#009688", 8);
				// this.sideCenters[i].text = "+" + "[" + i + "]";
				this.sideCenters[i].text = "+";
				this.sideCenters[i].fontSize = 20;
			}else if(this.sideNums[i]==1){//1是乘
				this.canvas.graphics.drawLine(path[i][0],path[i][1], path[next][0],path[next][1], "#1E9FFF", 8);
				// this.sideCenters[i].text = "x" + "[" + i + "]";
				this.sideCenters[i].text = "x";
				this.sideCenters[i].fontSize = 18;
			}
		}

		//画顶点
		for(var i=0;i<this.n;i++){
			this.canvas.graphics.drawCircle(path[i][0],path[i][1],20,"#FFFFFF","#CCCCCC", 2);
			this.vertices[i].pos(path[i][0]+this.canvas.x-10,path[i][1]+this.canvas.y-5);
			// this.vertices[i].text = this.verticeNums[i] + "[" + i + "]";
			this.vertices[i].text = this.verticeNums[i];
		}
	}

	return End;
})(EndUI)