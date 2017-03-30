(function() {
    // 将HTML转换为节点
    function html2node(str) {
        var container = document.createElement('div');
        container.innerHTML = str;
        return container.children[0];
    }
    // 赋值属性
    // extend({a:1}, {b:1, a:2}) -> {a:1, b:1}
    function extend(o1, o2) {
        for (var i in o2)
            if (typeof o1[i] === 'undefined') {
                o1[i] = o2[i];
            }
        return o1;
    }
    //增加类名
    function addClass(obj, classname, interval) {
        var classVal = obj.getAttribute("class");
        var addClass = classVal.concat(" " + classname);
        obj.setAttribute("class", addClass);
        if (interval >= 0) {
            setTimeout(function() {
                obj.setAttribute("class", classVal);
            }, interval);
        }
    }
    //重置类名
    function resetClass(obj, classname) {
        obj.setAttribute("class", classname);
    }

    var emitter = {
        // 注册事件
        on: function(event, fn) {
            var handles = this._handles || (this._handles = {}),
                calls = handles[event] || (handles[event] = []);

            // 找到对应名字的栈
            calls.push(fn);

            return this;
        },
        // 解绑事件
        off: function(event, fn) {
            if (!event || !this._handles) this._handles = {};
            if (!this._handles) return;

            var handles = this._handles,
                calls;

            if (calls = handles[event]) {
                if (!fn) {
                    handles[event] = [];
                    return this;
                }
                // 找到栈内对应listener 并移除
                for (var i = 0, len = calls.length; i < len; i++) {
                    if (fn === calls[i]) {
                        calls.splice(i, 1);
                        return this;
                    }
                }
            }
            return this;
        },
        // 触发事件
        emit: function(event) {
            var args = [].slice.call(arguments, 1),
                handles = this._handles,
                calls;

            if (!handles || !(calls = handles[event])) return this;
            // 触发所有对应名字的listeners
            for (var i = 0, len = calls.length; i < len; i++) {
                calls[i].apply(this, args)
            }
            return this;
        }
    }

    //html
    var template =
        `<div class="lockmobile">
        <div class="header">
            <h1>手势密码</h1>
        </div>
        <div class="main-panel">
            <div class="main-password">
                <canvas id="main-can" width="300" height="300"></canvas>
            </div>
            <div id="reminder" class="reminder">请输入密码</div>
            <div class="option-panel">
                <div>
                    <input type="radio" name="set-check" id="l-set" checked data-role="none" class="l-input">
                    <label for="l-set">设置密码</label>
                </div>
                <div>
                    <input type="radio" name="set-check" id="l-check" data-role="none" class="l-input">
                    <label for="l-check">验证密码</label>
                </div>
                <div>
                    <input type="radio" name="set-check" id="l-show" data-role="none" class="l-input">
                    <label for="l-show">显示密码</label>
                </div>
                <div>
                    <input type="radio" name="set-check" id="l-delete" data-role="none" class="l-input">
                    <label for="l-delete">清空密码</label>
                </div>
            </div>
        </div>
    </div>`;



    //local storage
    var STORAGE_KEY = 'lock-mobile';
    var lockStorage = {
        fetch: function() {
            var password = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"path_order":[],"path_exist":{}}');
            lockStorage.uid = password.length;
            return password;
        },
        save: function(password) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(password));
        }
    };
    

    //构造函数
    window.LockMobile = function(options) {
        options = options || {};
        extend(this, options);
        this.container = this.container || document.body;
        this.container.style.overflow = 'hidden';
        this.lockmobile = this._layout.cloneNode(true);
        this.container.appendChild(this.lockmobile);
        this.header = document.getElementsByClassName("header");
        this.canvas = document.getElementById("main-can");
        this.stat = document.getElementsByClassName("l-input");
        this.reminder = document.getElementById("reminder");
        this.ctx = this.canvas.getContext("2d");
        this.canvas_fa = document.getElementsByClassName("main-password")[0];
        this.canvas_w = this.canvas.width = this.canvas_fa.offsetWidth;
        this.canvas_h = this.canvas.height = this.canvas_w;
        this.r = this.canvas_w / 12;
        this.offsettop = this.canvas.offsetTop;
        this.offsetleft = this.canvas.offsetLeft;
        //圆心point
        this.point = [];
        //0代表没有，1代表点了,用于解决电脑端没有mousedown就move的问题
        this.mouse_stat = 0;
        // ableChange为1代表可以改变页面，0代表不能，用于显示密码清空密码等操作不可使用页面输入密码
        this.ableChange = 1;
        //status: 0为空， 1设置密码第一次，2设置密码第一次,3表示验证密码,4为显示密码
        //status跟path_obj相关
        this.status = 1;
        this.path_obj = [{
            //清空用的0
            path_order: [],
            path_exist: {}
        }, {
            //设置密码1
            path_order: [],
            path_exist: {}
        }, {
            //设置密码2
            path_order: [],
            path_exist: {}
        }, {
            //验证密码3
            path_order: [],
            path_exist: {}
        }];
        this.startEvt, this.moveEvt, this.endEvt;
        this.reminderClass = this.reminder.getAttribute("class");

    }
    extend(LockMobile.prototype, {

        _layout: html2node(template),
        init: function() {
            var point_x = [this.canvas_w / 6, this.canvas_w / 2, this.canvas_w * 5 / 6];
            this.header[0].style.lineHeight = this.header[0].offsetHeight + "px";
            for (var i = 0; i < point_x.length; ++i) {
                for (var j = 0; j < point_x.length; ++j) {
                    this.point.push([point_x[j], point_x[i]]);
                }
            }
            //兼容电脑端和手机端
            if ("ontouchstart" in window) {
                this.startEvt = "touchstart";
                this.moveEvt = "touchmove";
                this.endEvt = "touchend";
            } else {
                this.startEvt = "mousedown";
                this.moveEvt = "mousemove";
                this.endEvt = "mouseup";
            }
            this.uppdateCan(this.path_obj[0]);
            this.bindEvt();

        },
        uppdateCan: function() { //更新数据，不传参数则根据当前mouse是否按下状态改变，
            this.ctx.clearRect(0, 0, this.canvas_w, this.canvas_h);
            if (arguments.length == 0) {
                if (this.mouse_stat == 1) {
                    this._drawArc(this.path_obj[this.status]);
                    this._drawLine(this.path_obj[this.status]);
                } else {
                    this._drawArc(this.path_obj[0]);
                    this._drawLine(this.path_obj[0]);
                }
            } else {
                for (var i = 0; i < arguments.length; ++i) {
                    this._drawArc(arguments[i]);
                    this._drawLine(arguments[i]);
                }
            }


        },
        //获取touch的点(兼容mouse事件)
        _getTouchPos: function(e) {
            var touches = e.touches;
            if (touches && touches[0]) {
                return {
                    x: touches[0].clientX,
                    y: touches[0].clientY
                };
            }
            return {
                x: e.clientX,
                y: e.clientY
            };
        },
        bindEvt: function() { //所有事件绑定
            var that = this;
            this.canvas.addEventListener(this.startEvt, function(e) {
                if (that.ableChange == 0) return;
                console.log("start");
                e.preventDefault();
                that.uppdateCan(that.path_obj[0]);
                var pos = that._getTouchPos(e);
                that._showOntime(pos.x, pos.y);
                that.mouse_stat = 1;
                resetClass(that.reminder, that.reminderClass);
            });
            this.canvas.addEventListener(this.moveEvt, function(e) {
                if (that.ableChange == 0) return;
                console.log("move");
                if (that.mouse_stat == 1) {
                    e.preventDefault();
                    var pos = that._getTouchPos(e);
                    that._showOntime(pos.x, pos.y);
                    that._drawFollowline(that.path_obj[that.status], pos.x, pos.y);
                }
            });
            this.canvas.addEventListener(this.endEvt, function(e) {
                if (that.ableChange == 0) return;
                console.log("end");
                that.uppdateCan();
                that.mouse_stat = 0;

                if (that.path_obj[that.status].path_order.length <= 4) {
                    that.reminder.innerText = "密码太短，至少需要5个点！";
                    that._clearPath(that.path_obj[that.status]);
                    addClass(that.reminder, " animated shake red", 1000);
                    setTimeout(function() {
                        that.uppdateCan(that.path_obj[0])
                    }, 1000);
                    return;
                }
                if (that.status == 1) {
                    that.status = 2;
                    that.reminder.innerText = "请再次输入手势密码！";
                } else if (that.status == 2) {
                    if (that._checkSame(that.path_obj[1], that.path_obj[2])) {
                        that.reminder.innerText = "设置密码成功";
                        that.emit('setSuccess');
                        addClass(that.reminder, " animated rubberBand  green", 1000);
                        that.status = 1;
                        lockStorage.save(that.path_obj[1]);
                        that._clearPath(that.path_obj[1], that.path_obj[2], that.path_obj[3]);
                    } else {
                        that.reminder.innerText = "两次输入不一致！";
                        addClass(that.reminder, " animated wobble red", 1000);
                        that._clearPath(that.path_obj[2]);
                    }
                } else if (that.status == 3) {

                    if (that._checkSame(lockStorage.fetch(), that.path_obj[0])) {
                        that.reminder.innerText = "密码还没设置好呢！";
                        addClass(that.reminder, " animated shake", 1000);
                        setTimeout(function() {
                            that.uppdateCan(that.path_obj[0])
                        }, 1000);
                        return;
                    }
                    if (that._checkSame(that.path_obj[3], lockStorage.fetch())) {
                        that.reminder.innerText = "密码正确！！";
                        that.emit('unlockSuccess');
                        addClass(that.reminder, " animated zoomIn green", 1000);
                        that._clearPath(that.path_obj[3]);

                    } else {
                        that.reminder.innerText = "输入的密码不正确！";
                        addClass(that.reminder, " animated wobble red", 1000);
                        that._clearPath(that.path_obj[3]);
                    }
                }
                setTimeout(function() {
                    that.uppdateCan(that.path_obj[0])
                }, 1000);

            });
            //几个input radio点击之后会触发事件改变 当前状态，设置密码，验证密码，显示密码
            for (var i = 0; i < this.stat.length; ++i) {
                this.stat[i].addEventListener("click", function(i) {
                    return function() {
                        if (that.stat[0].checked) {
                            that.status = 1;
                            that.ableChange = 1;
                        } else if (that.stat[1].checked) {
                            that._clearPath(that.path_obj[1], that.path_obj[2]);
                            that.status = 3;
                            that.ableChange = 1;
                        } else if (that.stat[2].checked) {
                            that.uppdateCan(lockStorage.fetch());
                            that.ableChange = 0;
                            that._clearPath(that.path_obj[1], that.path_obj[2], that.path_obj[3]);
                            return;
                        } else if (that.stat[3].checked) {
                            lockStorage.save(that.path_obj[0]);
                            that.ableChange = 0;
                            that._clearPath(that.path_obj[1], that.path_obj[2], that.path_obj[3]);
                        }
                        that.uppdateCan();
                    }
                }(i));
            };
        },

        //画圆--包括选择了的圆
        _drawArc: function(obj) {
            this.ctx.strokeStyle = "#d2d2d3";
            for (var i = 0; i < this.point.length; ++i) {
                this.ctx.fillStyle = "white";
                this.ctx.beginPath();
                this.ctx.arc(this.point[i][0], this.point[i][1], this.r, 0, 2 * Math.PI);

                this.ctx.stroke();
                if (i in obj.path_exist) {
                    this.ctx.fillStyle = "#ffa726";
                }

                this.ctx.fill();
            }
        },

        //画线
        _drawLine: function(obj) {
            var len = obj.path_order.length;
            if (len <= 1) return;
            this.ctx.beginPath();
            this.ctx.moveTo(this.point[obj.path_order[0]][0], this.point[obj.path_order[0]][1]);


            for (var i = 1; i < len; ++i) {
                this.ctx.lineTo(this.point[obj.path_order[i]][0], this.point[obj.path_order[i]][1]);
            }
            this.ctx.strokeStyle = "red";
            this.ctx.stroke();
        },

        //画鼠标追随的线
        _drawFollowline: function(obj, x, y) {
            this.ctx.clearRect(0, 0, this.canvas_w, this.canvas_h);
            this.uppdateCan(this.path_obj[this.status]);
            var len = obj.path_order.length || 0;
            if (len <= 0) return;
            this.ctx.beginPath();
            this.ctx.moveTo(this.point[obj.path_order[len - 1]][0], this.point[obj.path_order[len - 1]][1]);
            this.ctx.lineTo(x - this.offsetleft, y - this.offsettop);
            this.ctx.strokeStyle = "red";
            this.ctx.stroke();
        },

        //查看是否在圆内，返回对应的圆序号
        _checkRange: function(x, y) {
            for (var i = 0; i < this.point.length; ++i) {
                var dis = (x - this.offsetleft - this.point[i][0]) * (x - this.offsetleft - this.point[i][0]) + (y - this.offsettop - this.point[i][1]) * (y - this.offsettop - this.point[i][1]);
                if (dis <= (this.r * this.r)) {
                    return i;
                }
            }
            return -1;
        },

        //重置传入对象的内容，不传入则全部清空，传入则清空传入的对象。
        _clearPath: function() {
            var len = arguments.length;
            if (len == 0) {
                for (var i = 0; i < path_obj.length; ++i) {
                    this.path_obj[i].path_order = [];
                    this.path_obj[i].path_exist = {};
                }
                return;
            }
            for (var i = 0; i < len; ++i) {
                arguments[i].path_order = [];
                arguments[i].path_exist = {};
            }

        },

        //查看两个对象内容是否相同，从而检测验证密码是否正确和两次输入是否正确
        _checkSame: function(obj1, obj2) {
            if (this._user_checkSame) {
                return this._user_checkSame(obj1, obj2);
            }
            var len = obj1.path_order.length;
            if (obj2.path_order.length != len) return false;
            for (var i = 0; i < len; ++i) {
                if (obj1.path_order[i] != obj2.path_order[i]) return false;
            }
            return true;
        },

        //实时更改path_obj里面的内容，同时refesh来改变。
        _showOntime: function(x, y) {

            var inArc = this._checkRange(x, y);
            if (inArc == -1) return;

            if (inArc in this.path_obj[this.status].path_exist) return;
            this.path_obj[this.status].path_order.push(inArc);
            this.path_obj[this.status].path_exist[inArc] = 1;
            this.uppdateCan(this.path_obj[this.status]);
        }


    });
    extend(LockMobile.prototype, emitter);

})();
