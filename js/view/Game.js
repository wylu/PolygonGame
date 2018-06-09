/**Created by the LayaAirIDE*/
	var Game=(function(_super){

		//--------------------------------------------分割线------------------------------------------------------------------------------
		function Game(n,RADIUS,minNum,maxNum){
			Game.__super.call(this);

			//记录游戏状态
			this.stepPaths = [];

			//设置多边形的边数
			this.n = n;
			this.N = n;
			//多边形顶点的整数值
			this.verticeNums = this.getRandomNums(n,minNum,maxNum);
			// this.verticeNums = [-4,-9,-2,3,-4,-5];
			//多边形的边符号
			this.sideNums = this.getRandomNums(n,0,1);
			// this.sideNums = [1,1,0,0,1,1];
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
			//设置监听
			this.canvas.on(Laya.Event.CLICK,this,this.onClick);
			//添加到舞台
        	Laya.stage.addChild(this.canvas);

			//撤销按钮
			Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createUndoBtn));
			//最高分方案按钮
			Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createBestSolutionBtn));
			//新游戏按钮
			Laya.loader.load("res/ui/button.png", Laya.Handler.create(this, this.createNewGameBtn));
			
			//顶点的文本
			this.vertices = [];
			for(var i=0;i<n;i++){
				this.vertices[i] = new Laya.Text();
				Laya.stage.addChild(this.vertices[i]);
			}
			//多边形的边中点符号文本
			this.sideCenters = [];
			for(var i=0;i<n;i++){
				this.sideCenters[i] = new Laya.Text();
				Laya.stage.addChild(this.sideCenters[i]);
			}

			//计算多边形点的位置,存储在path中
			this.path = this.getVertexCoordinates(this.cX,this.cY,this.RADIUS,this.n);
			this.drawSomething(this.path);

			this.stepPaths[0] = new GameState(this.n,this.path,this.verticeNums,this.sideNums);
		}


		Laya.class(Game,'view.Game',_super);
		var _proto = Game.prototype;

		//设置undo按钮参数
		_proto.createUndoBtn = function(){
			this.undoBtn = new Laya.Button("res/ui/button.png","undo");
			Laya.stage.addChild(this.undoBtn);
			this.undoBtn.width = 80;
			this.undoBtn.height = 30;
			this.undoBtn.pos(720, 1);
			this.undoBtn.on(Laya.Event.CLICK, this, this.returnLastStep);
		}

		//设置BestSolution按钮参数
		_proto.createBestSolutionBtn = function(){
			this.bestSolutionBtn = new Laya.Button("res/ui/button.png","BestSolution");
			// Laya.stage.addChild(this.bestSolutionBtn);
			this.bestSolutionBtn.width = 80;
			this.bestSolutionBtn.height = 30;
			this.bestSolutionBtn.pos(360, 285);
			this.bestSolutionBtn.on(Laya.Event.CLICK, this, this.bestSolution);
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
		 * 撤销操作
		 */
		_proto.returnLastStep = function(){
			// console.log("undo:", this.stepPaths[this.step].verticeNums);
			if(this.step >= 1){
				this.score.text = "";
				if(!Laya.stage.contains(this.vertices[0])) Laya.stage.addChild(this.vertices[0]);
				Laya.stage.removeChild(this.bestSolutionBtn);
				this.verticeNums = this.stepPaths[this.step].verticeNums;
				this.sideNums = this.stepPaths[this.step].sideNums;
				this.path = this.stepPaths[this.step].path;
				this.n = this.stepPaths[this.step].n;
				this.step -= 1;
				this.drawSomething(this.path);
			}
		}

		/**
		 * 删除一条边
		 */
		_proto.remove = function(a){
			// console.log("a:", a);
			this.step += 1;
			this.stepPaths[this.step] = new GameState(this.n,this.path,this.verticeNums,this.sideNums);
			if(this.step==1){
				//一开始删除的边，实际上并没有删除，置其为2，表示展示时，不进行绘制
				this.sideNums[a]=2;
			}else if(this.step<=this.N){
				// console.log("sideNums[" + a + "]= ", this.sideNums[a]);
				if(this.n == 2){ //剩余顶点数为2时，特殊处理
					if(this.sideNums[a] == 2) a = (a == 1) ? 0 : 1;
				}else{
					if(this.sideNums[a] == 2){
						this.stepPaths.pop();
						this.step -= 1;
						return;
					}
				}
				var next = (a == this.n-1) ? 0 : a+1;
				//计算新点的值
				if(this.sideNums[a] == 0){
					this.verticeNums[next] += this.verticeNums[a];
				}else{
					this.verticeNums[next] *= this.verticeNums[a];
				}
				//移除第a条边的坐标（0开始计数）
				this.path.splice(a, 1); 
				//除去第a个点
				this.verticeNums.splice(a, 1); 
				//除去第a条边
				this.sideNums.splice(a,1);
				//顶点数减一
				this.n = this.n-1;
			}
			this.drawSomething(this.path);
			// console.log("verticeNums: ", this.verticeNums.length);
			if(this.step == this.N){
				this.canvas.graphics.clear();
				Laya.stage.removeChild(this.vertices[0]);
				this.score.text = "你的得分:" + this.verticeNums[0];
				Laya.stage.addChild(this.bestSolutionBtn);
			}
		}

		_proto.bestSolution = function(){
			this.removeSelf();
			this.canvas.destroy();
			//清理顶点数值
			for(var i=0;i<this.N;i++){
				this.vertices[i].destroy();
				this.sideCenters[i].destroy();
			}
			LayaMain.end = new End(this.stepPaths[0], this.RADIUS, this.verticeNums[0]);
			this.bestSolutionBtn.destroy();
			this.undoBtn.destroy();
			this.newGameBtn.destroy();
			Laya.stage.addChild(LayaMain.end);
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
			this.bestSolutionBtn.destroy();
			this.undoBtn.destroy();
			Laya.stage.addChild(LayaMain.begin);
		}

		/**
		 * 判断选择了哪一边
		 * args:
		 * 		n:多边形顶点数
		 * 		x:鼠标点击的横坐标
		 * 		y:鼠标点击的纵坐标
		 * 		path:数组，存放各顶点的坐标依次存放x0，y0，x1，y1...xn-1，yn-1
		 * return:
		 * 		a:点击的是第a条边(从0开始计数)，第a条边指第a个顶点与a+1个顶点的边（顶点也从0开始计数）
		 */
		_proto.whichSide = function(n,x,y,path) {	
			var a;
			var min=Number.MAX_VALUE;  //存放最小距离
			var dis;  //暂时存放距离
			for(var i=0;i<n;i++){
				next = (i == n-1) ? 0 : i+1;
				dis=this.getDistance(path[i][0],path[i][1],path[next][0],path[next][1],x,y);
				if(dis<min){
					min=dis;  //得到最小距离的边
					a=i;
				}
			}
			if(min > 15) return -1;
			return a;
		}

		/**
		 * 点击多边形的监听
		 */
		_proto.onClick = function(e){
			if(this.verticeNums.length > 1){
				var a = this.whichSide(this.n,e.stageX-this.canvas.x,e.stageY-this.canvas.y,this.path);
				if(a >= 0) this.remove(a);
			}
			// console.log("mouse:", Laya.stage.mouseX, Laya.stage.mouseY);
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
				next = (i == this.n-1) ? 0 : i+1;
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

		/**
		 * 获取顶点坐标
		 * args:
		 * 		cX:中心点横坐标
		 * 		cY:中心点纵坐标
		 * 		RADIUS:多边形外切圆半径
		 * 		n:多边形顶点数
		 * return:
		 * 		返回一个数组，存放各顶点的坐标依次存放x0，y0，x1，y1...xn-1，yn-1
		 */
		_proto.getVertexCoordinates = function(cX,cY,RADIUS,n) {
			var result = [];
			for(var i=0;i<n;i++){
				var coordinate = [];
				coordinate[0] = cX+RADIUS*Math.cos(i*2*Math.PI/n); //x坐标
				coordinate[1] = cY+RADIUS*Math.sin(i*2*Math.PI/n); //y坐标
				result[i] = coordinate;
			}
			return result;
		}

		/**
		 * 获取指定个数以及指定范围的随机数序列
		 * args:
		 * 		n:要生成随机数的个数
		 * 		Min:随机数的最小值
		 * 		Max:随机数的最大值
		 * return:
		 * 		以数组的形式返回一个随机序列
		 */
		_proto.getRandomNums = function(n,Min,Max){
			var result = [];
			var Range = Max - Min;
			for(var i=0;i<n;i++){
				var Rand = Math.random();
				result[i] = Min + Math.round(Rand * Range); //四舍五入
			}
			return result;
		}

		/**
		 * 已知直线上两点求直线的一般式方程
		 * 已知直线上的两点P1(X1,Y1) P2(X2,Y2)， P1 P2两点不重合。则直线的一般式方程AX+BY+C=0中，A B C分别等于：
		 * 		A = Y2 - Y1
		 * 		B = X1 - X2
		 * 		C = X2*Y1 - X1*Y2
		 * 计算点（x3,y3）到(x1,y1)与(x2,y2)构成直线的距离
		 */
		_proto.getDistance = function(x1,y1,x2,y2,x3,y3) {
			var A=y2-y1;
			var B=x1-x2;
			var C=y1*x2-x1*y2;
			var dis=Math.abs(A*x3+B*y3+C)/Math.sqrt(A*A+B*B);  //距离计算公式
			return dis;
		}
	
		return Game;
	})(GameUI)