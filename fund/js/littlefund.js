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
        },
        add_fund: {
            isShow: false,
            title: '',
            money: null,
            detail: ''
        },
        add_expense: {
            isShow: false,
            title: '',
            money: null,
            detail: ''
        }
    },
    created: function() {
        this.updateData();
    },
    methods: {
        updateData: function() {
            var fund_url = "http://fund.xuehebinglan.com/fund/list";
            var expense_url = "http://fund.xuehebinglan.com/expense/list?fund_id=";

            this.$http.get(fund_url).then(function(data) {
                var jdata = JSON.parse(data.body);
                var that = this;
                var p = [];
                jdata.forEach(function(fund) {
                    Vue.set(that.fund_data, fund.fund_id, fund);
                    var re = that.$http.get(expense_url + fund.fund_id).then(function(data) {
                        var jdata = JSON.parse(data.body);
                        Vue.set(that.expense_data, fund.fund_id, {});
                        jdata.forEach(function(expense) {
                            Vue.set(that.expense_data[fund.fund_id], expense.exp_id, expense);
                            Vue.set(that.left_money, fund.fund_id, []);
                        });
                    });
                    p.push(re);
                });
                this.total_fund = jdata.length;
                return Promise.all(p);
            }).then(function(arg) {
                var that = this;
                console.log(that.expense_data);
                for (var id in that.expense_data) {
                    var that = this;
                    var used_money = 0;
                    if (that.expense_data[id].length == 0) {
                        that.left_money[id] = that.fund_data[id].money;
                    } else {
                        for (var e_id in that.expense_data[id]) {
                            console.log(that.expense_data[id][e_id].money);
                            used_money += that.expense_data[id][e_id].money;
                        }
                        that.left_money[id] = that.fund_data[id].money - used_money;
                    }
                }
            })
        },
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
        },
        addExpense: function() {
            //最后如果没有其他功能，这句话就直接写在html里面算了
            this.add_expense.isShow = false;
            var url = "http://fund.xuehebinglan.com/expense/add?fund_id=" + this.show_id + "&title=" + this.add_expense.title + "&detail=" + this.add_expense.detail + "&money=" + this.add_expense.money;
            var that = this;
            this.$http.get(url).then(function() {
                console.log(url);
                that.updateData();
            });
        },
        deleteExpense: function() {
            var ev = ev || window.event;
            var target = ev.target || ev.srcElement;
            var e_id = target.id.substring(6);
            console.log(e_id);
            var url = "http://fund.xuehebinglan.com/expense/delete?exp_id=" + e_id;
            var that = this;
            this.$http.get(url).then(function() {
                console.log(url);
                that.updateData();
            });
        },
        addFund: function() {
            this.add_fund.isShow = false;
            var url = "http://fund.xuehebinglan.com/fund/add?title=" + this.add_fund.title + "&detail=" + this.add_fund.detail + "&money=" + this.add_fund.money;
            var that = this;
            this.$http.get(url).then(function() {
                console.log(url);
                that.updateData();
            });
        },
        deleteFund: function() {
            var url = "http://fund.xuehebinglan.com/fund/delete?fund_id=" + this.show_id;
            var that = this;
            this.$http.get(url).then(function() {
                console.log(url);
                this.fund_show.isShow = false;
                that.resetData();
                that.updateData();

            });
        },
        resetData: function () {
            this.fund_data = {};
            this.expense_data = {};

        }
    }
})

myapp.$mount('.littlefund')
