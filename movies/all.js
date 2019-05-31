// 页面1根实例
var page1 = new Vue({
	el: '#all',
	data: {
		headerHidden: false,
		modeOrder: 1,
		screenHidden: true,
		sortOrder: 1,
		isReverse: false,
		activeTags: [],
		isStretch: false,
		isFocus: false,
		searchText: '',
		tags: [
		{
			isActive: false,
			tag: '变异'
		},
		{
			isActive: false,
			tag: '病毒'
		},
		{
			isActive: false,
			tag: '穿越'
		},
		{
			isActive: false,
			tag: '怪物'
		},
		{
			isActive: false,
			tag: '基因'
		},
		{
			isActive: false,
			tag: '末日'
		},
		{
			isActive: false,
			tag: '奇幻'
		},
		{
			isActive: false,
			tag: '烧脑'
		},
		{
			isActive: false,
			tag: '神话'
		},
		{
			isActive: false,
			tag: '太空'
		},
		{
			isActive: false,
			tag: '探险'
		},
		{
			isActive: false,
			tag: '逃生'
		},
		{
			isActive: false,
			tag: '外星'
		},
		{
			isActive: false,
			tag: '未来'
		},
		{
			isActive: false,
			tag: '灾难'
		},
		{
			isActive: false,
			tag: '哲学'
		},
		{
			isActive: false,
			tag: '罪案'
		},
		{
			isActive: false,
			tag: '爱情'
		},
		{
			isActive: false,
			tag: '惊悚'
		},
		{
			isActive: false,
			tag: '历史'
		},
		{
			isActive: false,
			tag: '魔鬼'
		},
		{
			isActive: false,
			tag: '人性'
		},
		{
			isActive: false,
			tag: '丧尸'
		},
		{
			isActive: false,
			tag: '同性'
		},
		{
			isActive: false,
			tag: '无限'
		},
		{
			isActive: false,
			tag: '血腥'
		},
		{
			isActive: false,
			tag: '战争'
		},
		{
			isActive: false,
			tag: '致郁'
		},
		{
			isActive: false,
			tag: '重口'
		},
		{
			isActive: false,
			tag: '宗教'
		}
		],
		moreHidden: true,
		moreActive: false,
		isPull: false,
		loadSuccess: false,
		loadError: false,
		films: [],
		isSave: false
	},
	mounted () {
		// 首次加载数据
		this.isPull = true;
		this.loadData();
	},
	directives: {
		// 输入框自动获得焦点
		focus: {
			inserted (el) {
				el.focus();
			}
		}
	},
	methods: {
		// 加载数据并显示状态信息，然后收起状态栏，然后复位信息
		loadData () {
			// 给json地址添加时间戳
			var date = new Date(),
			allfilms = 'http://192.168.199.126:8080/movies/all-films.json?t=' + date.getTime();

			axios.get(allfilms, {timeout: 5000})
			.then(function (response) {
				page1.onClear();
				page1.searchText = '';
				page1.films = response.data;
				page1.loadSuccess = true;
				console.log(response);
			})
			.catch(function (error) {
				page1.loadError = true;
				console.log(error);
			})
			.then(function () {
				setTimeout(function () {
					page1.isPull = false;
					setTimeout(function () {
						page1.loadSuccess = false;
						page1.loadError = false;
					}, 300);
				}, 1500);
			});
		},
		// 点击按钮展开搜索框/清除搜索文本
		onSearch () {
			this.isStretch = true;
			if (this.searchText.length > 0) {
				this.searchText = '';
			}
		},
		// 点击不同按钮切换排序方式，点击同一按钮切换正倒序
		onSort (order) {
			this.sortOrder = order;
			if (order == 2) {
				this.revScore = !this.revScore;
				this.revYear = true;
				this.revRecent = true;
			} else if (order == 3) {
				this.revRecent = !this.revRecent;
				this.revYear = true;
				this.revScore = true;
			} else {
				this.revYear = !this.revYear;
				this.revScore = true;
				this.revRecent = true;
			}
		},
		// 点击切换标签激活状态；若选中则添加到筛选信息中，否则从中删除
		onTag (item, index) {
			item.isActive = !item.isActive;
			if (item.isActive) {
				this.searchText = '';
				this.activeTags.push(item.tag);
				if (index > 16) {
					this.moreActive = true;
				} else {}
			} else {
				var atIndex = this.activeTags.indexOf(item.tag);
				this.activeTags.splice(atIndex, 1);
			}
		},
		// 清空所有选中的标签
		onClear () {
			var i, len;
			for (i = 0, len = this.tags.length; i < len; i++) {
				this.tags[i].isActive = false;
			}
			this.activeTags.splice(0);
		},
		// 上滑时隐藏导航栏
		swipeUp () {
			if (this.headerHidden == false) {
				this.headerHidden = true;
			}
		},
		// 下滑时显示导航栏；滚动到顶部时下滑触发下拉更新
		swipeDown () {
			if (this.headerHidden == true) {
				this.headerHidden = false;
			}

			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (scrollTop == 0) {
				this.isPull = true;
				setTimeout(function () {
					page1.loadData();
				}, 1000);
			}
		},
		// 点击保存1s后显示提示信息，显示1s后消失
		onSave () {
			setTimeout(function () {
				page1.isSave = true;
				setTimeout(function () {
					page1.isSave = false;
				}, 2000);
			}, 1000);
		},
		// 不同分数级别显示不同颜色
		scoreColor (item) {
			var colors = ['#cd0000', '#cd8500', '#cdcd00', '#00cd00', '#00cdcd', '#0000cd', '#912cee'],
			colorIndex = Math.floor(item.score) - 3;

			return colors[colorIndex];
		}
	},
	computed: {
		// 电影排序：年份/评分/更新
		sortFilms () {
			var sortOrder = this.sortOrder,
			isReverse = this.isReverse;

			return this.films.sort(function (a, b) {
				if (sortOrder == 1) {
					return isReverse ? b.year - a.year : a.year - b.year;
				} else if (sortOrder == 2) {
					return isReverse ? a.score - b.score : b.score - a.score;
				} else {
					return isReverse ? a.id - b.id : b.id - a.id;
				}
			});
		},
		// 电影过滤：类型标签/搜索文本
		filterFilms () {
			var activeTags = this.activeTags,
			searchText = this.searchText;

			return this.sortFilms.filter(function (item) {
				if (activeTags.length > 0) {
					// 标签：遍历每一个选中标签，返回包含至少一个标签的所有项
					var i, lenI;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						if (item.type.includes(activeTags[i])) {
							return true;
						}
					}
				} else if (searchText.length > 0) {
					// 搜索：将搜索文本按空格分割为关键词，清除数据文本的所有标点符号，返回包含至少一个关键词的所有项
					var stArr = searchText.split(' '),
					keys = [item.transName, item.year, item.offiName, item.country, item.type, item.director, item.star, item.comment],
					j, lenJ,
					k, lenK;

					for (j = 0, lenJ = stArr.length; j < lenJ; j++) {
						for (k = 0, lenK = keys.length; k < lenK; k++) {
							if (keys[k].replace(/[ \/ ·，“”……：]+/g, '').toLowerCase().includes(stArr[j].toLowerCase())) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			});
		}
	},
	watch: {
		// 排序方式变化时复位倒序属性
		sortOrder (newOrder, oldOrder) {
			this.isReverse = false;
		},
		// 搜索时清空标签
		searchText (newText, oldText) {
			if (this.searchText.length > 0) {
				this.onClear();
			}
		}
	}
});

// 底部导航栏
var footer = new Vue({
	el: '#footer',
	data: {
		pageOrder: 1
	}
});

// bootstrap相关jquery脚本
$(function () {
	// 折叠组件：工具栏
	var screenCollapse = $('#screenCollapse');
	// 筛选按钮变色；筛选信息隐藏/显示
	screenCollapse.on('show.bs.collapse', function () {
		page1.screenHidden = false;
	});
	// 若有标签被激活则收起搜索框；若有更多标签被激活则不折叠更多标签
	screenCollapse.on('hidden.bs.collapse', function () {
		page1.screenHidden = true;
		page1.moreHidden = true;
		if (page1.activeTags.length > 0) {
			page1.isStretch = false;
			page1.isFocus = false;

			var i, len;
			for (i = 0, len = page1.tags.length; i < len; i++) {
				if (page1.tags[i].isActive && i > 16) {
					page1.moreHidden = false;
				}
			}
		}
	});
	// 收起筛选面板和搜索框；若搜索框有内容则不收起
	function foldUp() {
		screenCollapse.collapse('hide');
		if (page1.searchText.length == 0) {
			page1.isStretch = false;
			page1.isFocus = false;
		}
	}
	// 点击其他位置收起
	var nToolBar = $('#topNav, #detailMode, #miniMode, #seriesMode, #bottomDivider, #toTop, #toBottom, #bottomNav');
	nToolBar.on('click', function () {
		foldUp();
	});
	// 页面滚动时收起
	$(document).on('scroll', function () {
		foldUp();
	});

	// 滚动条动画
	var toTop = $('#toTop'),
	toBottom = $('#toBottom'),
	toAll = $('#toAll');
	// 回到顶部
	toTop.on('click', function () {
		$('html, body').animate({ scrollTop: 0 }, 300, 'linear', function () {
			page1.headerHidden = false;
		});
	});
	// 直达底部
	toBottom.on('click', function () {
		var height = $(document).height();
		$('html, body').animate({ scrollTop: height }, 300, 'linear', function () {
			page1.headerHidden = false;
		});
	});
	// 回到顶部并刷新
	toAll.on('click', function () {
		$(document).scrollTop(0);
		page1.headerHidden = false;
		page1.isPull = true;
		setTimeout(function () {
			page1.loadData();
		}, 1000);
	});
});