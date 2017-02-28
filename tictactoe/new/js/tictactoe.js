	// 将HTML转换为节点
	function html2node(str){
		var container = document.createElement('div');
		container.innerHTML = str;
		return container.children[0];
	}
	//html
	var template = 
	"<div class='t-box'></div>";

	//事件绑定函数，兼容浏览器差异
	function addEvent(element, event, listener) {
	    if (element.addEventListener) {
	        element.addEventListener(event, listener, false);
	    }
	    else if (element.attachEvent) {
	        element.attachEvent("on" + event, listener);
	    }
	    else {
	        element["on" + event] = listener;
	    }
	}


	//构造函数
	function Tictactoe(id) {

		//turn 1代表用户1，2代表用户2
		//pos_arr代表9个位置当前的情况
		
		this.turn = 1;
		this.pos_arr = [0,0,0,0,0,0,0,0,0];
		this.tictactoe = document.getElementById(id);
		for (var i = 0; i < 9; ++i) {
			this.tictactoe.appendChild(html2node(template));
		}
		
		this.boxes = document.getElementsByClassName("t-box");

		//下棋，改变位置
		this.playChess = function(pos) {
			this.pos_arr[pos] = this.turn;
		};
		this.changeTurn = function() {
			if (this.turn == 1) {
				this.turn = 2;
				return;
			}
			this.turn = 1;
		};
		
		//显示函数，每次根据pos_arr来改变
		this.display = function() {
			for (var i = 0; i < this.boxes.length; ++i) {
				if(this.pos_arr[i] == 1) {
					this.boxes[i].innerText = "X";
				} else if (this.pos_arr[i] == 2) {
					this.boxes[i].innerText = "O";
				} else {
					this.boxes[i].innerText = "";
				}
			}
		};
		this.clearAll = function(time) {
			var that = this;
			setTimeout(function(){
				for (var i = 0; i < that.boxes.length; ++i) {
					that.boxes[i].innerText = "";
					that.changeColor(that.boxes[i],"");
					that.pos_arr = [0,0,0,0,0,0,0,0,0];
				}
			},time);
			
			
		};
		this.whoIsWin = function() {
			if (this.isSame(this.pos_arr[0],this.pos_arr[1],this.pos_arr[2]) && this.pos_arr[0] != 0) {
				this.changeColor(this.boxes[0],this.boxes[1],this.boxes[2],"orange");
				return this.pos_arr[0];
			}
			if (this.isSame(this.pos_arr[0],this.pos_arr[3],this.pos_arr[6]) && this.pos_arr[0] != 0) {
				this.changeColor(this.boxes[0],this.boxes[3],this.boxes[6],"orange");
				return this.pos_arr[0];
			}
			if (this.isSame(this.pos_arr[0],this.pos_arr[4],this.pos_arr[8]) && this.pos_arr[0] != 0) {
				this.changeColor(this.boxes[0],this.boxes[4],this.boxes[8],"orange");
				return this.pos_arr[0];
			}
			if (this.isSame(this.pos_arr[4],this.pos_arr[1],this.pos_arr[7]) && this.pos_arr[4] != 0) {
				this.changeColor(this.boxes[4],this.boxes[1],this.boxes[7],"orange");
				return this.pos_arr[4];
			}
			if (this.isSame(this.pos_arr[4],this.pos_arr[2],this.pos_arr[6]) && this.pos_arr[4] != 0) {
				this.changeColor(this.boxes[4],this.boxes[2],this.boxes[6],"orange");
				return this.pos_arr[4];
			}
			if (this.isSame(this.pos_arr[4],this.pos_arr[3],this.pos_arr[5]) && this.pos_arr[4] != 0) {
				this.changeColor(this.boxes[4],this.boxes[3],this.boxes[5],"orange");
				return this.pos_arr[4];
			}
			if (this.isSame(this.pos_arr[8],this.pos_arr[2],this.pos_arr[5]) && this.pos_arr[8] != 0) {
				this.changeColor(this.boxes[8],this.boxes[2],this.boxes[5],"orange");
				return this.pos_arr[8];
			}
			if (this.isSame(this.pos_arr[8],this.pos_arr[6],this.pos_arr[7]) && this.pos_arr[8] != 0) {
				this.changeColor(this.boxes[8],this.boxes[6],this.boxes[7],"orange");
				return this.pos_arr[8];
			}
			return 0;
		};
		this.isSame = function(a,b,c) {
			return (a == b) && (a == c);
		};
		this.changeColor = function() {
			var len = arguments.length;
			for (var i = 0; i < len - 1; ++i) {
				arguments[i].style.backgroundColor = arguments[len - 1];
			}
		}
	}




