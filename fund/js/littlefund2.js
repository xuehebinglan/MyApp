var myapp = new Vue({
    data: {
        fund_data: {}, //每个对象是id，内容是对应的内容
        //title_id: {}, //根据title查询id
        fund_list: [],
        total_fund: 0,
        expense_data: {},
        left_money: {},
        show_id:'',
        fund_show: {
            f_id: '',
            isShow: false
                // title: '',
                // money: '',
                // detail: '',
                // create_at: ''
        }
    },
    mounted: function() {
        var fund_url = "http://fund.xuehebinglan.com/fund/list";
        var expense_url = "http://fund.xuehebinglan.com/expense/list?fund_id=";

        this.$http.get(fund_url).then(function(data) {
            var jdata = JSON.parse(data.body);
            var that = this;
            jdata.forEach(function(fund) {
                // that.fund_data[fund.fund_id] = {};
                // that.title_id[fund.title] = {};
                // that.title_id['isSelected'] = {};
                that.fund_data[fund.fund_id] = fund;
                that.fund_data[fund.fund_id]['isSelected'] = false;
                that.fund_list.push(false);
                // that.title_id[fund.title] = fund.fund_id;
                // that.title_id[fund.title]['isSelected'] = false;
            });
            this.total_fund = jdata.length;
            console.log(this.total_fund)
        }).then(function() {
            var that = this;
            var p = [];
            for (var id in that.fund_data) {
                var that = this;
                console.log("abc " + id + " def");
                // (function(id) {
                //     return function() {
                        var rp = that.$http.get(expense_url + id).then(function(data) {
                            console.log(id);
                            var jdata = JSON.parse(data.body);
                            // console.log(jdata);
                            that.expense_data[id] = [];
                            jdata.forEach(function(expense,index) {
                                that.expense_data[id][index] = expense;
                                that.left_money[id] = [];
                            });
                            console.log("我在第二个then里面");
                            // console.log(that.expense_data);
                        });
                //     }
                // })(id)();
                p.push(rp);
            }
            return Promise.all(p);
        }).then(function(arg) {
            console.log(this.expense_data);
            console.log(this.expense_data[1]);
        	 // var that = this;
        	 // console.log(that.expense_data);
        	 // // debugger
        	 // for (var id in that.fund_data) {
        	 // 	// console.log("fund_data[id]:" + id);
        	 // 	console.log(JSON.stringify(that.fund_data));
        	 // 	console.log(JSON.stringify(that.expense_data));
        	 // 	console.log(that.expense_data[1]);
        	 // 	for (var idx in that.expense_data[id]) {
        	 // 		console.log(that.expense_data[idx].money);
        	 // 	}
        	 // }
        })
            // var that = this;
            // // debugger 
            // console.log(that.fund_data);
            // console.log(that.expense_data);
            // // debugger 
            // for(var i in that.fund_data) {console.log(i);}
            // for(var i in that.expense_data) {console.log(i);}
            // for (var id in that.expense_data) {
            //     var that = this;
            //     console.log(id);
            //     console.log(that.expense_data);
            //     console.log(that.expense_data[1]);
            //     // if (that.expense_data[id].length == 0) {
            //     //     that.left_money[id] = fund_data[id].money;
            //     // } else {
            //     //     var used_money = 0;
            //     //     for (var i = 0; i < that.expense_data[id].length; ++i) {
            //     //         used_money += expense_data[id][i].money;
            //     //     }
            //     //     that.left_money[id] = fund_data[id].money - used_money;
            //     // }
            // }

        // })

    },
    // mounted: function() {
        // var that = this;
        // console.log(that.fund_data);
        //     console.log(that.expense_data);
        //     // debugger 
        //     for(var i in that.fund_data) {console.log("fund"+i);}
        //     for(var i in that.expense_data) {console.log("expense"+i);}
    // },
    methods: {
        showFund: function(ev) {
            var ev = ev || window.event;
            var target = ev.target || ev.srcElement;
            // if (target.nodeName.toLowerCase() == "button") {
            this.resetBtn();
            target.style.background = "pink";

            var id = target.id.substring(6);
            console.log(id);
            this.fund_show.isShow = true;
            this.fund_show.f_id = id;
            this.show_id = id;
            // this.fund_show.title = this.fund_data[id].title;
            // this.fund_show.money = this.fund_data[id].money;
            // this.fund_show.detail = this.fund_data[id].detail;
            // this.fund_show.create_at = this.fund_data[id].create_at;
            // }
            // console.log(this.fund_data[id].isSelected);
            // this.fund_data[id].isSelected = !this.fund_data[id].isSelected;
            // this.fund_data[id].isSelected = true;

        },
        resetBtn: function() {
            var btns = document.getElementsByClassName('fundbtn');
            for (var i = 0; i < btns.length; ++i) {
                btns[i].style.background = "white";
            }
        }
    }
})

myapp.$mount('.littlefund')
