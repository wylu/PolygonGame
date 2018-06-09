/*
* name;
*/
var GameState = (function (_super) {
    function GameState(n, path, verticeNums, sideNums) {
        this.n = n;
        this.path = path.slice();
        this.verticeNums = verticeNums.slice();
        this.sideNums = sideNums.slice();
    }
    Laya.class(GameState,'view.GameState',_super);
    return GameState;
}());