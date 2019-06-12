// 页面1根实例
var page1 = new Vue({
	el: '#all',
	data: {
		films: [],
		series: [],
		headerHidden: false,
		screenHidden: true,
		sortOrder: 1,
		isReverse: false,
		activeTags: [],
		isStretch: false,
		isFocus: false,
		searchText: '',
		sorts: ['年份', '评分', '更新'],
		tags: [
		{
			tag: '变异',
			isActive: false
		},
		{
			tag: '病毒',
			isActive: false
		},
		{
			tag: '穿越',
			isActive: false
		},
		{
			tag: '怪物',
			isActive: false
		},
		{
			tag: '基因',
			isActive: false
		},
		{
			tag: '末日',
			isActive: false
		},
		{
			tag: '奇幻',
			isActive: false
		},
		{
			tag: '烧脑',
			isActive: false
		},
		{
			tag: '神话',
			isActive: false
		},
		{
			tag: '太空',
			isActive: false
		},
		{
			tag: '探险',
			isActive: false
		},
		{
			tag: '逃生',
			isActive: false
		},
		{
			tag: '外星',
			isActive: false
		},
		{
			tag: '未来',
			isActive: false
		},
		{
			tag: '灾难',
			isActive: false
		},
		{
			tag: '哲学',
			isActive: false
		},
		{
			tag: '罪案',
			isActive: false
		},
		{
			tag: '爱情',
			isActive: false
		},
		{
			tag: '惊悚',
			isActive: false
		},
		{
			tag: '历史',
			isActive: false
		},
		{
			tag: '魔鬼',
			isActive: false
		},
		{
			tag: '人性',
			isActive: false
		},
		{
			tag: '丧尸',
			isActive: false
		},
		{
			tag: '同性',
			isActive: false
		},
		{
			tag: '无限',
			isActive: false
		},
		{
			tag: '血腥',
			isActive: false
		},
		{
			tag: '战争',
			isActive: false
		},
		{
			tag: '致郁',
			isActive: false
		},
		{
			tag: '重口',
			isActive: false
		},
		{
			tag: '宗教',
			isActive: false
		}
		],
		moreHidden: true,
		isPull: false,
		isSuccess: false,
		isError: false,
		isSave: false,
		isReload: false
	},
	mounted() {
		// 初始化所有数据
		this.loadData();
	},
	directives: {
		// 自定义指令：元素自动获得焦点
		focus: {
			inserted(el) {
				el.focus();
			}
		}
	},
	methods: {
		// 加载数据并显示状态：若成功则清除筛选信息，然后收起状态栏；否则显示错误提示
		loadData() {
			var time = new Date().getTime(),
			filmsUrl = 'http://192.168.199.126:8080/movies/all-films.json?t=' + time,
			seriesUrl = 'http://192.168.199.126:8080/movies/all-series.json?t=' + time;

			function getFilms() {
				return axios.get(filmsUrl, {timeout: 5000});
			}

			function getSeries() {
				return axios.get(seriesUrl, {timeout: 5000});
			}

			axios.all([getFilms(), getSeries()])
			.then(axios.spread(function (resFilms, resSeries) {
				page1.clearTags();
				page1.hideSearch();
				console.log('getRes:', resFilms, resSeries);
				page1.films = resFilms.data;
				console.log('getFilms:', page1.films);
				page1.series = resSeries.data;
				console.log('getSeries:', page1.series);
				page1.isReload = false;
				page1.isSuccess = true;
				setTimeout(function () {
					page1.isPull = false;
				}, 1500);
			}))
			.catch(function (error) {
				console.warn('catchError:', error);
				page1.isReload = false;
				page1.isError = true;
				page1.isPull = true;
			})
			.then(function () {
				console.log('finalData:', page1.films, page1.series);
			});
		},
		// 清空所有选中的标签
		clearTags() {
			var i, len;
			for (i = 0, len = this.tags.length; i < len; i++) {
				this.tags[i].isActive = false;
			}

			this.activeTags.splice(0);
		},
		// 清空搜索文本，收起并隐藏搜索框
		hideSearch() {
			this.searchText = '';
			this.isFocus = false;
			this.isStretch = false;
		},
		// 点击按钮展开搜索框/清除搜索文本
		onSearch() {
			if (!this.isStretch) {
				this.clearTags();
				this.isStretch = true;
			}

			if (this.searchText.length > 0) {
				document.getElementsByTagName('input')[0].focus();
				this.searchText = '';
			}
		},
		// 点击不同按钮切换排序方式，点击同一按钮切换正倒序
		onSort(index) {
			this.sortOrder = index + 1;
			this.isReverse = !this.isReverse;
		},
		// 点击切换标签激活状态；若选中则添加到筛选信息中，否则从中删除；激活时关闭搜索框
		onTag(item) {
			item.isActive = !item.isActive;
			if (item.isActive) {
				this.hideSearch();
				this.activeTags.push(item.tag);
			} else {
				var atIndex = this.activeTags.indexOf(item.tag);
				this.activeTags.splice(atIndex, 1);
			}
		},
		// 上滑时隐藏导航栏
		swipeUp() {
			var scrollHeight = document.body.scrollHeight,
			viewportHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight,
			bottomHeight = document.querySelector('.divider').offsetHeight;

			if (!this.headerHidden && scrollHeight - bottomHeight > viewportHeight) {
				this.headerHidden = true;
			}
		},
		// 下滑时显示导航栏；顶部下滑时触发下拉刷新
		swipeDown() {
			if (this.headerHidden) {
				this.headerHidden = false;
			}

			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (scrollTop == 0) {
				this.pullReload();
			}
		},
		// 复位所有状态信息并展开更新栏，然后重新加载数据
		pullReload() {
			this.isSuccess = false;
			this.isError = false;
			this.isPull = true;
			setTimeout(function () {
				page1.loadData();
			}, 1000);
		},
		// 点击保存1s后显示提示信息，显示1s后消失
		onSave() {
			setTimeout(function () {
				page1.isSave = true;
				setTimeout(function () {
					page1.isSave = false;
				}, 2000);
			}, 1000);
		},
		// 评分七个级别显示不同颜色
		getColor(item) {
			var colors = ['#912cee', '#0000cd', '#00cdcd', '#00cd00', '#cdcd00', '#cd8500', '#cd0000'],
			scoreIndex = 9 - Math.floor(item.score);

			return colors[scoreIndex];
		},
		// 点击直接刷新数据；在顶部时点击触发下拉刷新
		onReload() {
			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (scrollTop > 0) {
				this.isReload = true;
				setTimeout(function () {
					page1.loadData();
				}, 1000);
			} else {
				this.pullReload();
			}
		}
	},
	computed: {
		// 电影排序：年份/评分/更新
		sortFilms() {
			var sortOrder = this.sortOrder,
			isReverse = this.isReverse;

			return this.films.sort(function (a, b) {
				if (sortOrder == 1) {
					if (a.year == b.year) {
						return a.id - b.id;
					} else {
						return isReverse ? b.year - a.year : a.year - b.year;
					}
				} else if (sortOrder == 2) {
					if (a.score == b.score) {
						return a.id - b.id;
					} else {
						return isReverse ? a.score - b.score : b.score - a.score;
					}
				} else {
					return isReverse ? a.id - b.id : b.id - a.id;
				}
			});
		},
		// 电影过滤：评分级别/类型标签/搜索文本
		filterFilms() {
			var activeTags = this.activeTags,
			searchText = this.searchText;

			return this.sortFilms.filter(function (item) {
				if (activeTags.length > 0) {
					// 标签：遍历每一个选中标签，返回包含至少一个标签的所有项
					let i, len;
					for (i = 0, len = activeTags.length; i < len; i++) {
						if (item.type.includes(activeTags[i])) {
							return true;
						}
					}
				} else if (searchText.length > 0) {
					// 搜索：将搜索文本按空格分割为关键词，清除数据文本的所有标点符号，返回包含至少一个关键词的所有项
					var stArr = searchText.split(' '),
					keys = [item.transName, item.year, item.offiName, item.country, item.type, item.director, item.star, item.comment];

					let i, lenI, j, lenJ;
					for (i = 0, lenI = stArr.length; i < lenI; i++) {
						for (j = 0, lenJ = keys.length; j < lenJ; j++) {
							if (keys[j].replace(/[ \/ ·，“”……：]+/g, '').toLowerCase().includes(stArr[i].toLowerCase())) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			});
		},
		// 系列排序：年份/评分/更新
		sortSeries() {
			var sortOrder = this.sortOrder,
			isReverse = this.isReverse;

			return this.series.sort(function (a, b) {
				if (sortOrder == 1) {
					if (a.firstYear == b.firstYear) {
						return a.seriesId - b.seriesId;
					} else {
						return isReverse ? b.firstYear - a.firstYear : a.firstYear - b.firstYear;
					}
				} else if (sortOrder == 2) {
					if (a.topScore == b.topScore) {
						return a.seriesId - b.seriesId;
					} else {
						return isReverse ? a.topScore - b.topScore : b.topScore - a.topScore;
					}
				} else {
					return isReverse ? a.seriesId - b.seriesId : b.seriesId - a.seriesId;
				}
			});
		},
		// 系列过滤：类型标签/搜索文本
		filterSeries() {
			var activeTags = this.activeTags,
			searchText = this.searchText;

			return this.sortSeries.filter(function (item) {
				var filmList = item.filmList;
				if (activeTags.length > 0) {
					// 标签：遍历每一个选中标签，返回包含至少一个标签的所有项
					let i, lenI, j, lenJ;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						for (j = 0, lenJ = filmList.length; j < lenJ; j++) {
							if (filmList[j].type.includes(activeTags[i])) {
								return true;
							}
						}
					}
				} else if (searchText.length > 0) {
					// 搜索：将搜索文本按空格分割为关键词，清除数据文本的所有标点符号，返回包含至少一个关键词的所有项
					var stArr = searchText.split(' ');
					
					let i, lenI, j, lenJ, k, lenK;
					for (i = 0, lenI = stArr.length; i < lenI; i++) {
						for (j = 0, lenJ = filmList.length; j < lenJ; j++) {
							var keys = [filmList[j].transName, filmList[j].year, filmList[j].offiName, filmList[j].country, filmList[j].type, filmList[j].director, filmList[j].star, filmList[j].comment];
							for (k = 0, lenK = keys.length; k < lenK; k++) {
								if (keys[k].replace(/[ \/ ·，“”……：]+/g, '').toLowerCase().includes(stArr[i].toLowerCase())) {
									return true;
								}
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
		sortOrder() {
			this.isReverse = false;
		}
	}
});

// jquery脚本
$(function () {
	// 折叠组件：工具栏
	var screenCollapse = $('#screen-collapse');
	// 筛选面板展开时按钮变色、隐藏筛选信息
	screenCollapse.on('show.bs.collapse', function () {
		page1.screenHidden = false;
	});

	// 筛选面板收起后按钮变色、显示筛选信息、隐藏更多标签；若有更多标签被激活则不隐藏
	screenCollapse.on('hidden.bs.collapse', function () {
		page1.screenHidden = true;
		page1.moreHidden = true;
		if (page1.activeTags.length > 0) {
			let i, len;
			for (i = 17, len = page1.tags.length; i < len; i++) {
				if (page1.tags[i].isActive) {
					page1.moreHidden = false;
				}
			}
		}
	});

	// 点击其他位置收起筛选面板；若搜索文本为空也收起搜索框
	var nToolbar = $('#all-header, #detail-mode, #mini-mode, #series-mode, #to-top, #to-bottom, #footer');
	nToolbar.on('click', foldUp);
	function foldUp() {
		screenCollapse.collapse('hide');
		if (page1.searchText.length == 0) {
			page1.hideSearch();
		}
	}

	// 页面滚动条效果
	var toTop = $('#to-top'),
	toBottom = $('#to-bottom');

	// 回到顶部
	toTop.on('click', function () {
		$('html, body').animate({ scrollTop: 0 }, 300, 'linear');
		page1.headerHidden = false;
	});

	// 直达底部
	toBottom.on('click', function () {
		var height = $(document).height();
		$('html, body').animate({ scrollTop: height }, 300, 'linear');
		page1.headerHidden = false;
	});

	// 页面滚动时收起筛选面板及搜索框，快到顶部时显示顶部导航栏；在顶部时隐藏向上和刷新按钮，在底部时隐藏向下按钮
	$(document).on('scroll', function () {
		foldUp();
		var scrollTop = $(document).scrollTop();
		console.log(scrollTop);
		if (scrollTop < 100) {
			page1.headerHidden = false;
		}

		if (scrollTop == 0) {
			toTop.fadeOut('fast');
		} else {
			toTop.fadeIn();
		}

		var height = $(document).height() - $(window).height();
		if (scrollTop == height) {
			toBottom.fadeOut('fast');
		} else {
			toBottom.fadeIn();
		}
	});
});