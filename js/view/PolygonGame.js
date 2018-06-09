/*
* name;
*/
var PolygonGame = (function (_super) {
    function PolygonGame(n,op,v) {
        this.n = n;
        this.op = [];
        this.v = [];
        this.m = this.get3DArray();
        this.init(n, op, v);
        this.cut = this.get3DArray(); //记录断点
        this.firstDelEdge; //记录最优情况下，第1条删除的边
        this.stack = new Array(); //记录最优合并边的顺序
        this.bestScore; //记录最优得分
    }
    Laya.class(PolygonGame,'view.PolygonGame',_super);
    var _proto = PolygonGame.prototype;

    _proto.init = function(n, op, v){
        for(var i=1; i<=n; i++){
            this.op[i] = op[i-1];
            this.v[i] = v[i];
        }
        this.v[n] = v[0];
        for(var i=1; i<=n; i++) this.m[i][1][0] = this.m[i][1][1] = this.v[i];
    }

    _proto.polyMax = function(){
        var resMap = new Array();
        for(var j=2; j<=this.n; j++){ //链的长度
            for(var i=1; i<=this.n; i++){ //删除第i条边
                this.m[i][j][0] = 999999999999999;
                this.m[i][j][1] = -999999999999999;
                for(var s=1; s<j; s++){ //断开的位置
                    resMap = this.minMax(i, s, j, resMap);
                    if(this.m[i][j][0] > resMap["minf"]){
                        this.m[i][j][0] = resMap["minf"];
                        this.cut[i][j][0] = s; //记录该链取得最小值的分割点
                    }
                    if(this.m[i][j][1] < resMap["maxf"]){
                        this.m[i][j][1] = resMap["maxf"];
                        this.cut[i][j][1] = s; //记录该链取得最大值的分割点
                    }
                }
            }
        }
        this.bestScore = this.m[1][this.n][1];
        this.firstDelEdge = 1; //一开始删除的边,初始化为第一条边
        for(var i=2; i<=this.n; i++){
            if(this.bestScore < this.m[i][this.n][1]){
                this.bestScore = this.m[i][this.n][1];
                this.firstDelEdge = i; //如果一开始删除第i边有更优的结果，则更新
            }
        }
        for(var i=1; i<=this.n; i++){
            console.log("i=", i-1, " " + this.m[i][this.n][1]);
        }
        console.log("firstDelEdge=", this.firstDelEdge-1);
        this.getBestSolution(this.firstDelEdge, this.n, true);

        var edgeMergeStack = this.stack.slice();
        for(var i=edgeMergeStack.length-1; i>=0; i--) console.log("edgeMergeStack--> ", edgeMergeStack[i]-1);

        //转换回原来的格式，原来的起始值为0
        var bestMergeStack = new Array();
        bestMergeStack.push(this.firstDelEdge-1);
        while(edgeMergeStack.length != 0){
            bestMergeStack.push(edgeMergeStack.pop()-1);
        }
        return bestMergeStack.reverse();
    }

    _proto.minMax = function(i, s, j, resMap){
        var r = (i+s-1) % this.n + 1;
        var a = this.m[i][s][0], b = this.m[i][s][1], c = this.m[r][j-s][0], d = this.m[r][j-s][1];
        if(this.op[r] == 0){
            resMap["minf"] = a+c;
            resMap["maxf"] = b+d;
        }else{
            var e = [0, a*c, a*d, b*c, b*d];
            var minf = e[1], maxf = e[1];
            for(var k=2; k<5; k++){
                if(minf > e[k]) minf = e[k];
                if(maxf < e[k]) maxf = e[k];
            }
            resMap["minf"] = minf;
            resMap["maxf"] = maxf;
        }
        return resMap;
    }

    /**
     * 获取最优的合并序列，存入stack中
     * @param i 表示删除哪条边
     * @param j 子链的长度
     * @param needMax 是否取链的最大值，如果传入值为false，则取子链的最小值
     */
    _proto.getBestSolution = function(i, j, needMax){
        var s, r;
        if(j == 1) return; //链中只有一个顶点，直接返回
        if(j == 2){
            s = this.cut[i][j][1];
            r = (i+s-1) % this.n + 1;
            this.stack.push(r);
            return; //只有两个顶点时，没有子链，无须递归
        }
        s = needMax ? this.cut[i][j][1] : this.cut[i][j][0];
        r = (i+s-1) % this.n + 1;
        this.stack.push(r);
        if(this.op[r] == 0){ //当合并计算为"+"操作时
            if(needMax){ //如果合并得到的父链需要取得最大值
                this.getBestSolution(i, s, true);
                this.getBestSolution(r, j-s, true);
            }else{ //如果合并得到的父链需要取得最小值
                this.getBestSolution(i, s, false);
                this.getBestSolution(r, j-s, false);
            }
        }else{ //当合并计算为"*"操作时
            var a = this.m[i][s][0], b = this.m[i][s][1], c = this.m[r][j-s][0], d = this.m[r][j-s][1];
            var e = [0, a*c, a*d, b*c, b*d];
            var mergeMax = e[1], mergeMin = e[1];
            for(var k=2; k<=4; k++){
                if(e[k] > mergeMax) mergeMax = e[k];
                if(e[k] < mergeMin) mergeMin = e[k];
            }
            var merge = needMax ? mergeMax : mergeMin; //判断合并得到的父链是取最大还是取最小
            if(merge == e[1]){ //子链1和子链2都取最小
                this.getBestSolution(i, s, false);
                this.getBestSolution(r, j-s, false);
            }else if(merge == e[2]){ //子链1取最小，子链2取最大
                this.getBestSolution(i, s, false);
                this.getBestSolution(r, j-s, true);
            }else if(merge == e[3]){ //子链1取最大，子链2取最小
                this.getBestSolution(i, s, true);
                this.getBestSolution(r, j-s, false);
            }else{ //子链1和子链2都取最大
                this.getBestSolution(i, s, true);
                this.getBestSolution(r, j-s, true);
            }
        }
    }

    _proto.showPolygon = function(){
        var topBuilder = "op: ";
        for(var i=1; i<=this.n; i++){
            if(this.op[i] == 0) topBuilder += "+ "
            else topBuilder += "* ";
        }
        var midBuilder = "";
        var botBuilder = " ";
        for(var i=1; i<this.n; i++){
            midBuilder += "|" + this.v[i] + "|" + "--";
            if(this.op[i+1] == 0) midBuilder += "+";
            else midBuilder += "*";
            midBuilder += "--"
        }
        midBuilder += "|" + this.v[this.n] + "|";
        for(var i=1; i<midBuilder.length-1; i++){
            if(i==1 || i==midBuilder.length-2) botBuilder += "|";
            else if(i == Math.floor((midBuilder.length-1)/2)){
                if(this.op[1] == 0) botBuilder += "+";
                else botBuilder += "*";
            }else botBuilder += "_";
        }
        // console.log(topBuilder);
        console.log(midBuilder);
        console.log(botBuilder);
    }

    /**
     * 创建一个三维数组
     */
    _proto.get3DArray = function(){
        var d3Array = new Array();
        for(var p=0; p<=this.n; p++){
            d3Array[p] = new Array();
            for(var q=0; q<=this.n; q++){
                d3Array[p][q] = new Array();
            }
        }
        return d3Array;
    }

    return PolygonGame;
}());