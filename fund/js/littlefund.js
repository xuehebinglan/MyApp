var myapp = new Vue({
    data: {
        fund_data: {}, //每个对象是id，内容是对应的内容
        //title_id: {}, //根据title查询id
        fund_list: [],
        total_fund: 0,
        expense_data: {},
        left_money: {},
        show_id: '',
        fund_show: {
            f_id: '',
            isShow: false
                // title: '',
                // money: '',
                // detail: '',
                // create_at: ''
        }
    },
    created: function() {
        var fund_url = "http://fund.xuehebinglan.com/fund/list";
        var expense_url = "http://fund.xuehebinglan.com/expense/list?fund_id=";

        this.$http.get(fund_url).then(function(data) {
            var jdata = JSON.parse(data.body);
            var that = this;
            var p = [];
            jdata.forEach(function(fund) {
                that.fund_data[fund.fund_id] = fund;
                var re = that.$http.get(expense_url + fund.fund_id).then(function(data) {
                    var jdata = JSON.parse(data.body);
                    that.expense_data[fund.fund_id] = [];
                    jdata.forEach(function(expense, index) {
                        that.expense_data[fund.fund_id].push(expense);
                        that.left_money[fund.fund_id] = [];
                    });
                });
                p.push(re);
            });
            this.total_fund = jdata.length;
            return Promise.all(p);
        }).then(function(arg) {
            var that = this;
            for (var id in that.expense_data) {
                var that = this;
                var used_money = 0;
                if (that.expense_data[id].length == 0) {
                    that.left_money[id] = that.fund_data[id].money;
                } else {

                    for (var i = 0; i < that.expense_data[id].length; ++i) {
                        console.log(that.expense_data[id][i].money);
                        used_money += that.expense_data[id][i].money;
                    }
                    that.left_money[id] = that.fund_data[id].money - used_money;
                }
            }
        })
    },
    methods: {
        showFund: function(ev) {
            var ev = ev || window.event;
            var target = ev.target || ev.srcElement;
            this.resetBtn();
            target.style.background = "pink";

            var id = target.id.substring(6);
            console.log(id);
            this.fund_show.isShow = true;
            this.fund_show.f_id = id;
            this.show_id = id;
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
