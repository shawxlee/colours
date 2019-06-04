// 页面1根实例
var page1 = new Vue({
	el: '#all',
	data: {
		films: [],
		series: [],
		topHidden: false,
		colors: ['#912cee', '#0000cd', '#00cdcd', '#00cd00', '#cdcd00', '#cd8500', '#cd0000'],
		grade: 0,
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
		isPull: true,
		isSuccess: false,
		isError: false,
		isSave: false
	},
	mounted() {
		// 初始化所有数据
		this.loadData();
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
				page1.grade = 0;
				page1.clearTags();
				page1.hideSearch();
				console.log('getRes:', resFilms, resSeries);
				page1.films = resFilms.data;
				console.log('getFilms:', page1.films);
				page1.series = resSeries.data;
				console.log('getSeries:', page1.series);
				page1.isSuccess = true;
				setTimeout(function () {
					page1.isPull = false;
				}, 1500);
			}))
			.catch(function (error) {
				console.log('catchError:', error);
				page1.isError = true;
			})
			.then(function () {
				console.log('finalData:', page1.films, page1.series);
			});
		},
		loadFilms() {
			var time = new Date().getTime(),
			filmsUrl = 'http://192.168.199.126:8080/movies/all-films.json?t=' + time;

			axios.get(filmsUrl, {timeout: 5000})
			.then(function (response) {
				console.log('getRes:', response);
				page1.films = response.data;
				console.log('getFilms:', page1.films);
				page1.isSuccess = true;
				setTimeout(function () {
					page1.isPull = false;
				}, 1500);
			})
			.catch(function (error) {
				console.log('catchError:', error);
				page1.isError = true;
				page1.isPull = true;
			})
			.then(function () {
				console.log('finalFilms:', page1.films);
			});
		},
		loadSeries() {
			var time = new Date().getTime(),
			seriesUrl = 'http://192.168.199.126:8080/movies/all-series.json?t=' + time;

			axios.get(seriesUrl, {timeout: 5000})
			.then(function (response) {
				console.log('getRes:', response);
				page1.series = response.data;
				console.log('getSeries:', page1.series);
				page1.isSuccess = true;
				setTimeout(function () {
					page1.isPull = false;
				}, 1500);
			})
			.catch(function (error) {
				console.log('catchError:', error);
				page1.isError = true;
				page1.isPull = true;
			})
			.then(function () {
				console.log('finalSeries:', page1.series);
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
		// 获取不同分级占总数量的百分比
		getPercen(index) {
			var films = this.films,
			gradeArr = films.filter(function (item) {
				return Math.floor(item.score) == 9 - index;
			});

			return Math.round(gradeArr.length / films.length * 100) + '%';
		},
		// 点击不同按钮切换分级，点击同一按钮激活/取消；激活时关闭搜索框
		onGrade(index) {
			if (this.grade == 9 - index) {
				this.grade = 0;
			} else {
				this.hideSearch();
				this.grade = 9 - index;
			}
		},
		// 点击按钮展开搜索框/清除搜索文本
		onSearch() {
			if (!this.isStretch) {
				this.grade = 0;
				this.clearTags();
				this.isStretch = true;
			}

			if (this.searchText.length > 0) {
				this.searchText = '';
			}

			var searchInput = document.getElementById('searchInput');
			searchInput.focus();
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
			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (!this.topHidden && scrollTop > 175) {
				this.topHidden = true;
			}
		},
		// 下滑时显示导航栏；滚动到顶部时下滑触发更新
		swipeDown() {
			if (this.topHidden) {
				this.topHidden = false;
			}

			var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			if (scrollTop == 0) {
				this.reloadData();
			}
		},
		// 下拉后重新加载数据
		reloadData() {
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
		// 获取评分所属级别的颜色
		getColor(item) {
			var scoreIndex = 9 - Math.floor(item.score);
			return this.colors[scoreIndex];
		}
	},
	computed: {
		// 电影排序：年份/评分/更新
		sortFilms() {
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
		// 电影过滤：评分级别/类型标签/搜索文本
		filterFilms() {
			var searchText = this.searchText,
			grade = this.grade,
			activeTags = this.activeTags;

			return this.sortFilms.filter(function (item) {
				if (searchText.length > 0) {
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
				} else if (grade > 0 && activeTags.length == 0) {
					// 仅分级：返回所有评分属于当前等级的项
					return Math.floor(item.score) == grade;
				} else if (grade == 0 && activeTags.length > 0) {
					// 仅标签：遍历每一个选中标签，返回包含至少一个标签的所有项
					let i, len;
					for (i = 0, len = activeTags.length; i < len; i++) {
						if (item.type.includes(activeTags[i])) {
							return true;
						}
					}
				} else if (grade > 0 && activeTags.length > 0) {
					// 分级+标签：遍历每一个选中标签，返回包含至少一个标签并且属于当前等级的所有项
					let i, len;
					for (i = 0, len = activeTags.length; i < len; i++) {
						if (Math.floor(item.score) == grade && item.type.includes(activeTags[i])) {
							return true;
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
					return isReverse ? b.firstYear - a.firstYear : a.firstYear - b.firstYear;
				} else if (sortOrder == 2) {
					return isReverse ? a.topScore - b.topScore : b.topScore - a.topScore;
				} else {
					return isReverse ? a.seriesId - b.seriesId : b.seriesId - a.seriesId;
				}
			});
		},
		// 系列过滤：类型标签/搜索文本
		filterSeries() {
			var searchText = this.searchText,
			grade = this.grade,
			activeTags = this.activeTags;

			return this.sortSeries.filter(function (item) {
				if (searchText.length > 0) {
					// 搜索：将搜索文本按空格分割为关键词，清除数据文本的所有标点符号，返回包含至少一个关键词的所有项
					var stArr = searchText.split(' ');
					
					let i, lenI, j, lenJ, k, lenK;
					for (i = 0, lenI = stArr.length; i < lenI; i++) {
						for (j = 0, lenJ = item.filmList.length; j < lenJ; j++) {
							let film = item.filmList[j],
							keys = [film.transName, film.year, film.offiName, film.country, film.type, film.director, film.star, film.comment];

							for (k = 0, lenK = keys.length; k < lenK; k++) {
								if (keys[k].replace(/[ \/ ·，“”……：]+/g, '').toLowerCase().includes(stArr[i].toLowerCase())) {
									return true;
								}
							}
						}
					}
				} else if (grade > 0 && activeTags.length == 0) {
					// 仅分级：返回所有评分属于当前等级的项
					let i, len;
					for (i = 0, len = item.filmList.length; i < len; i++) {
						if (Math.floor(item.filmList[i].score) == grade) {
							return true;
						}
					}
				} else if (grade == 0 && activeTags.length > 0) {
					// 仅标签：遍历每一个选中标签，返回包含至少一个标签的所有项
					let i, lenI, j, lenJ;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						for (j = 0, lenJ = item.filmList.length; j < lenJ; j++) {
							if (item.filmList[j].type.includes(activeTags[i])) {
								return true;
							}
						}
					}
				} else if (grade > 0 && activeTags.length > 0) {
					// 分级+标签：遍历每一个选中标签，返回包含至少一个标签并且属于当前等级的所有项
					let i, lenI, j, lenJ;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						for (j = 0, lenJ = item.filmList.length; j < lenJ; j++) {
							if (Math.floor(item.filmList[j].score) == grade && item.filmList[j].type.includes(activeTags[i])) {
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
		sortOrder() {
			this.isReverse = false;
		}
	}
});

// jquery脚本
$(function () {
	// 折叠组件：工具栏
	var screenSwitch = $('#screenSwitch');
	// 筛选按钮变色；筛选信息隐藏/显示
	screenSwitch.on('show.bs.collapse', function () {
		page1.screenHidden = false;
	});
	// 若有标签被激活则收起搜索框；若有更多标签被激活则不折叠更多标签
	screenSwitch.on('hidden.bs.collapse', function () {
		page1.screenHidden = true;
		page1.moreHidden = true;
		if (page1.activeTags.length > 0) {
			var lastIndex = page1.tags.lastIndexOf({isActive: true});
			if (lastIndex > 16) {
				page1.moreHidden = false;
			}
		}
	});
	// 收起筛选面板；若搜索文本为空也收起搜索框
	function foldUp() {
		screenSwitch.collapse('hide');
		if (page1.searchText.length == 0) {
			page1.hideSearch();
		}
	}
	// 点击其他位置收起
	var nToolbar = $('#topNav, #detailMode, #miniMode, #seriesMode, #toTop, #toBottom, #bottomNav');
	nToolbar.on('click', function () {
		foldUp();
	});
	// 页面滚动时收起；滚动快到顶部时即显示顶部导航栏
	$(document).on('scroll', function () {
		foldUp();
		var scrollTop = $(document).scrollTop();
		console.log(scrollTop);
		if (scrollTop < 100) {
			page1.topHidden = false;
		}
	});

	// 页面滚动动画效果
	var toTop = $('#toTop'),
	toBottom = $('#toBottom'),
	toAll = $('#toAll');
	// 回到顶部
	toTop.on('click', function () {
		$('html, body').animate({ scrollTop: 0 }, 300, 'linear');
		page1.topHidden = false;
	});
	// 直达底部
	toBottom.on('click', function () {
		var height = $(document).height();
		$('html, body').animate({ scrollTop: height }, 300, 'linear');
		page1.topHidden = false;
	});
	// 回到顶部并刷新
	toAll.on('click', function () {
		$(document).scrollTop(0);
		page1.topHidden = false;
		page1.reloadData();
	});
});