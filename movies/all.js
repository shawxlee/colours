// jquery脚本
$(function () {
	var loadingBg = $("#loadingBg"),
	loadingInfo = $("#loadingInfo"),
	errorInfo = $("#errorInfo"),
	loadAgain = $("#loadAgain");
	// 加载成功则移除加载页面，否则显示错误提示
	function loadData(url,vm) {
		$.getJSON(url, function (data,status) {
			if (status == "success") {
				vm.films = data;
				loadingBg.fadeOut("fast", "linear").remove();
			} else {
				loadingInfo.hide();
				errorInfo.show();
			}
		});
	}
	// 给json地址添加时间戳
	var allfilms = "http://192.168.199.126:8080/movies/all-films.json?t=" + new Date().getTime();
	// 首次加载数据
	loadData(allfilms,all);
	// 点击按钮重新加载数据
	loadAgain.on("click", function () {
		errorInfo.hide();
		loadingInfo.show();
		loadData(allfilms,all);
	});

	// 工具栏
	var screenToggler = $("#screenToggler"),
	screenCollapse = $("#screenCollapse");
	// 筛选按钮变色；筛选信息隐藏/显示
	screenCollapse.on("show.bs.collapse", function () {
		screenToggler.addClass("active");
		all.collapseHidden = false;
	});
	// 若有标签被激活则收起搜索框；若有更多标签被激活则不折叠更多标签
	screenCollapse.on("hidden.bs.collapse", function () {
		screenToggler.removeClass("active");
		all.collapseHidden = true;
		if (all.activeTags.length > 0) {
			all.isStretch = false;
			all.isFocus = false;
		}
		all.moreHidden = true;
		var i, len;
		for (i = 0, len = all.tags.length; i < len; i++) {
			if (all.tags[i].isActive) {
				if (i > 16) {
					all.moreHidden = false;
				}
			}
		}
	});
	// 收起筛选面板和搜索框；若搜索框有内容则不收起
	function foldUp() {
		screenCollapse.collapse("hide");
		if (all.searchText.length == 0) {
			all.isStretch = false;
			all.isFocus = false;
		}
	}
	// 点击其他位置收起
	var notScreen = $("#topNavbar, #detailMode, #miniMode, #seriesMode, #bottomDivider, #toTop, #toBottom, #footer");
	notScreen.on("click", function () {
		foldUp();
	});
	// 页面滚动时收起
	$(document).on("scroll", function () {
		foldUp();
	});

	// 页面滚动与刷新
	var toTop = $("#toTop"),
	toBottom = $("#toBottom"),
	toAll = $("#toAll");
	// 回到顶部
	toTop.on("click", function () {
		$("html, body").animate({ scrollTop: 0 }, 300, "linear");
	});
	// 直达底部
	toBottom.on("click", function () {
		$("html, body").animate({ scrollTop: $(document).height() }, 300, "linear");
	});
	// 回到顶部并刷新
	toAll.on("click", function () {
		$("html, body").animate({ scrollTop: 0 }, 100, "linear", function () {
			all.isPull = true;
		});
	});
});

// all页面根实例
var all = new Vue({
	el: '#all',
	data: {
		topHidden: false,
		collapseHidden: true,
		activeTags: [],
		sortOrder: 1,
		revYear: false,
		revScore: true,
		revRecent: true,
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
		},
		],
		moreHidden: true,
		isStretch: false,
		isFocus: false,
		searchText: '',
		isPull: false,
		reloadSuccess: false,
		reloadError: false,
		films: []
	},
	directives: {
		focus: {
			inserted (el) {
				el.focus();
			}
		}
	},
	methods: {
		// 点击按钮展开搜索框/清除搜索文本
		onSearch () {
			if (this.isStretch) {
				this.searchText = '';
			} else {
				this.isStretch = true;
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
		onTag (item) {
			item.isActive = !item.isActive;
			if (item.isActive) {
				this.searchText = '';
				this.activeTags.push(item.tag);
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
		onPull () {
			this.topHidden = false;

			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (scrollTop == 0) {
				this.isPull = true;
			}
		},
		// 不同分数级别显示不同颜色
		scoreColor (item) {
			var score = item.score;
			if (score >= 9) {
				return '#912cee';
			}
			else if (score < 9 && score >= 8) {
				return '#0000cd';
			}
			else if (score < 8 && score >= 7) {
				return '#00cdcd';
			}
			else if (score < 7 && score >= 6) {
				return '#00cd00';
			}
			else if (score < 6 && score >= 5) {
				return '#cdcd00';
			}
			else if (score < 5 && score >= 4) {
				return '#cd8500';
			}
			else {
				return '#cd0000';
			}
		}
	},
	computed: {
		// 标签过滤：默认显示前17个，点击更多显示完整30个
		filterTags () {
			var moreHidden = this.moreHidden;
			return this.tags.filter(function (item,index) {
				if (moreHidden) {
					return index < 17;
				} else {
					return true;
				}
			});
		},
		// 电影排序：年份/评分/更新
		sortFilms () {
			var sortOrder = this.sortOrder,
			revYear = this.revYear,
			revScore = this.revScore,
			revRecent = this.revRecent;

			return this.films.sort(function (a,b) {
				if (sortOrder == 1 && !revYear) {
					return a.year - b.year;
				} else if (sortOrder == 2 && !revScore) {
					return b.score - a.score;
				} else if (sortOrder == 3 && !revRecent) {
					return b.id - a.id;
				} else if (sortOrder == 1 && revYear) {
					return b.year - a.year;
				} else if (sortOrder == 2 && revScore) {
					return a.score - b.score;
				} else {
					return a.id - b.id;
				}
			});
		},
		// 电影过滤：类型标签/搜索文本
		filterFilms () {
			var activeTags = this.activeTags,
			searchText = this.searchText;

			return this.sortFilms.filter(function (item) {
				if (activeTags.length > 0) {
					// 标签过滤：遍历每一个选中标签，返回包含至少一个标签的所有项
					var i, lenI;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						if (item.type.includes(activeTags[i])) {
							return true;
						}
					}
				} else if (searchText.length > 0) {
					// 搜索过滤：将搜索文本按空格分割为关键词，清除数据文本的所有标点符号，返回包含至少一个关键词的所有项
					var stArr = searchText.split(' '),
					itemKeys = [item.transName, item.year, item.offiName, item.country, item.type, item.director, item.star, item.comment],
					j, lenJ,
					k, lenK;

					for (j = 0, lenJ = stArr.length; j < lenJ; j++) {
						for (k = 0, lenK = itemKeys.length; k < lenK; k++) {
							if (itemKeys[k].replace(/[ \/ ·，“”……：]+/g, '').toLowerCase().includes(stArr[j].toLowerCase())) {
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
		// 搜索时清空标签
		searchText () {
			if (this.searchText.length > 0) {
				this.onClear();
			}
		},
		// 下拉时重新加载数据并显示状态信息，否则复位信息
		isPull () {
			if (this.isPull == true) {
				var allfilms = "http://192.168.199.126:8080/movies/all-films.json?t=" + new Date().getTime(),
				films = this.films;

				setTimeout(function () {
					axios.get(allfilms)
					.then(function (response) {
						all.onClear();
						all.searchText = '';
						films = response;
						all.reloadSuccess = true;
					})
					.catch(function (error) {
						all.reloadError = true;
					})
					.then(function () {
						setTimeout(function () {
							all.isPull = false;
						}, 1000);
					});
				}, 1000);
			} else {
				this.reloadSuccess = false;
				this.reloadError = false;
			}
		}
	}
});

// 底部导航栏
var footer = new Vue({
	el: '#footer',
	data: {
		pageOrder: 1,
	},
});