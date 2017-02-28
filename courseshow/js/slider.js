//slider控件

(function(util) {

	// 将HTML转换为节点
	function html2node(str){
		var container = document.createElement('div');
		container.innerHTML = str;
		return container.children[0];
	}
	//html
	var template = 
	"<div class='slider'></div>";


	//构造函数
	function Slider(opt) {

		util.extend(this, opt);
		// 容器节点 以及 样式设置
		this.container = this.container || document.body;
		this.container.style.overflow = 'hidden';


		// 组件节点
		this.slider = html2node(template);
		var that = this;
		this.images.forEach(function(data) {
			that.slider.appendChild(html2node(
				"<a href='" + data['href'] + "'><img class='slider-img' src='" + data['src'] + "'></a>"
				));
		});
		this.slides = this.slider.children;

		// 内部数据结构
		this.page_total_num = this.images.length;
		this.page_idx = this.page_idx || 0;
		//初始化slider的zindex
		for (var slide_idx = 0; slide_idx < this.page_total_num; ++slide_idx) {
			if (slide_idx == this.page_idx) {
				this.slides[slide_idx].firstChild.style.zIndex = '1';
				this.slides[slide_idx].firstChild.style.opacity = '1';
			} else {
				this.slides[slide_idx].firstChild.style.zIndex = '0';
				this.slides[slide_idx].firstChild.style.opacity = '0';
			}

		}
		
		// this.pageNum 必须传入
		// 初始化动作
		this.container.appendChild(this.slider);
		// this.nav(this.page_idx);
	}

	util.extend(Slider.prototype, util.emitter);

	util.extend(Slider.prototype, {

		nav: function(page_idx) {
			// 点击的是当前激活的
			if (this.page_idx == page_idx) {
				return;
			}
			this.slides[this.page_idx].firstChild.style.zIndex = '0';
			this.slides[page_idx].firstChild.style.zIndex = '1';
			var that = this;
			var prev_page_idx = this.page_idx;
			util.fadein(this.slides[page_idx].firstChild,500, function(){
				that.slides[prev_page_idx].firstChild.style.opacity = '0';
			});
			this.page_idx = page_idx;
			this.emit('nav', this);
		},
		_step: function(offset) {
			this.nav((this.page_idx + offset + this.page_total_num) % this.page_total_num);
		},
		prev: function() {
			this._step(-1);
		},
		next: function() {
			this._step(1);
		}



	});


	window.Slider = Slider;
})(util);