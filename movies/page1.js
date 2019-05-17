// 利用js计算当前设备的DPR，动态设置html的font-size，利用css的选择器根据DPR来设置不同DPR下的字体大小
!function (win,lib) {
	var timer,
	doc = win.document,
	docElem = doc.documentElement,
	vpMeta = doc.querySelector('meta[name="viewport"]'),
	dpr = 0,
	scale = 0,
	flexible = lib.flexible || (lib.flexible = {});
	// 设置了 viewport meta
	if (vpMeta) {
		console.warn("将根据已有的<meta>标签来设置缩放比例");
		var initial = vpMeta.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
		if (initial) {
				scale = parseFloat(initial[1]); // 已设置的 initialScale
				dpr = parseInt(1 / scale);      // 设备像素比 devicePixelRatio
			}
		}
		function setFontSize() {
			var winWidth = docElem.getBoundingClientRect().width;
			if (winWidth / dpr > 540) {
				(winWidth = 540 * dpr);
			}
		// 根节点 fontSize 根据宽度决定
		var baseSize = winWidth / 25;
		docElem.style.fontSize = baseSize + "px";
		flexible.rem = win.rem = baseSize;
	}
	// 调整窗口时重置
	win.addEventListener("resize", function() {
		clearTimeout(timer);
		timer = setTimeout(setFontSize, 300);
	}, false);
	// orientationchange 时也需要重算下
	win.addEventListener("orientationchange", function() {
		clearTimeout(timer);
		timer = setTimeout(setFontSize, 300);
	}, false);
	// pageshow
	// keyword: 倒退 缓存相关
	win.addEventListener("pageshow", function(e) {
		if (e.persisted) {
			clearTimeout(timer);
			timer = setTimeout(setFontSize, 300);
		}
	}, false);
	// 设置基准字体
	if ("complete" === doc.readyState) {
		doc.body.style.fontSize = 12 * dpr + "px";
	} else {
		doc.addEventListener("DOMContentLoaded", function() {
			doc.body.style.fontSize = 12 * dpr + "px";
		}, false);
	}
	setFontSize();
	flexible.dpr = win.dpr = dpr;
	flexible.refreshRem = setFontSize;
	flexible.rem2px = function(d) {
		var c = parseFloat(d) * this.rem;
		if ("string" == typeof d && d.match(/rem$/)) {
			c += "px";
		}
		return c;
	};
	flexible.px2rem = function(d) {
		var c = parseFloat(d) / this.rem;
		if ("string" == typeof d && d.match(/px$/)) {
			c += "rem";
		}
		return c;
	}
} (window, window.lib || (window.lib = {}));

// 主要jquery脚本
$(function () {
	// 给json地址添加时间戳
	var reUrl = "http://192.168.199.126:8080/movies/films.json?t=" + new Date().getTime(),
	loadingBg = $("#loadingBg"),
	loadingInfo = $("#loadingInfo"),
	errorInfo = $("#errorInfo"),
	loadAgain = $("#loadAgain");
	// 加载成功则移除加载页面，否则显示错误提示
	function loadData() {
		$.getJSON(reUrl, function (data,status) {
			if (status == "success") {
				all.films = data;
				loadingBg.fadeOut("fast", "linear").remove();
			} else {
				loadingInfo.hide();
				errorInfo.show();
			}
		});
	}
	// 首次加载数据
	loadData();
	// 点击按钮重新加载数据
	loadAgain.on("click", function () {
		errorInfo.hide();
		loadingInfo.show();
		loadData();
	});

	// 搜索框
	var searchToggler = $("#searchToggler"),
	searchInput = $("#searchInput");
	// 点击按钮展开搜索框/清除搜索文本
	searchToggler.on("click", function () {
		if (all.stretchLeft) {
			all.searchText = '';
		} else {
			all.stretchLeft = true;
			searchInput.focus();
		}
	});
	// 按钮变色
	searchInput.on("focus blur", function () {
		searchToggler.toggleClass("active");
	});

	// 筛选面板
	var screenCollapse = $("#screenCollapse"),
	screenToggler = $("#screenToggler");
	// 筛选按钮变色；筛选信息隐藏/显示；若有标签被激活则收起搜索框
	screenCollapse.on("show.bs.collapse hidden.bs.collapse", function () {
		screenToggler.toggleClass("active");
		all.screenHidden = !all.screenHidden;
		if (all.activeTags.length > 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});

	// 收起筛选面板和搜索框
	var notScreen = $("#modeSwitch, #detailMode, #miniMode, #seriesMode, #bottomDivider, #toTop, #toBottom, #footer");
	// 点击其他位置收起；若搜索框有内容则不收起
	notScreen.on("click", function () {
		screenCollapse.collapse("hide");
		if (all.searchText.length == 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});
	// 页面滚动时收起；若搜索框有内容则不收起
	$(document).on("scroll", function () {
		screenCollapse.collapse("hide");
		if (all.searchText.length == 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});
	
	// 下拉更新
	var topDivider = $("#topDivider");
	function foldUp() {
		all.pullDown = false;
		if (topDivider.css("transform") == "translateY(-2rem)") {
			all.isReloading = true;
			all.reloadSuccess = false;
			all.notModified = false;
			all.reloadError = false;
		}
	}
	// 下拉更新并显示状态
	function reloadData() {
		all.pullDown = true;
		if (topDivider.css("transform") == "translateY(0)") {
			$.post(reUrl, function (data,status) {
				if (status == "success") {
					all.clearTags();
					all.searchText = '';
					all.films = data;
					all.isReloading = false;
					all.reloadSuccess = true;
				} else if (status == "notmodified") {
					all.isReloading = false;
					all.notModified = true;
				} else {
					all.isReloading = false;
					all.reloadError = true;
				}
			}, "json");
			// 0.1s后收起更新状态
			setTimeout(foldUp, 100);
		}
	}

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
		$("html, body").animate({ scrollTop: 0 }, 100, "linear", reloadData);
	});
});

// vue实例
var all = new Vue({
	el: '#all',
	data: {
		screenHidden: true,
		activeTags: [],
		sortOrder: 1,
		revYear: false,
		revScore: true,
		revRecent: true,
		tags: [
		{
			isActive: false,
			tag: '病毒'
		},
		{
			isActive: false,
			tag: '怪物'
		},
		{
			isActive: false,
			tag: '鬼魂'
		},
		{
			isActive: false,
			tag: '惊悚'
		},
		{
			isActive: false,
			tag: '历险'
		},
		{
			isActive: false,
			tag: '猎奇'
		},
		{
			isActive: false,
			tag: '魔幻'
		},
		{
			isActive: false,
			tag: '末日'
		},
		{
			isActive: false,
			tag: '丧尸'
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
			tag: '时空'
		},
		{
			isActive: false,
			tag: '同性'
		},
		{
			isActive: false,
			tag: '未来'
		},
		{
			isActive: false,
			tag: '星际'
		},
		{
			isActive: false,
			tag: '血腥'
		},
		{
			isActive: false,
			tag: '灾难'
		},
		{
			isActive: false,
			tag: '罪案'
		}
		],
		stretchLeft: false,
		searchText: '',
		pullDown: false,
		isReloading: true,
		reloadSuccess: false,
		notModified: false,
		reloadError: false,
		films: [],
	},
	methods: {
		// 点击不同按钮切换排序方式，点击同一按钮切换正倒序
		sortActive (order) {
			this.sortOrder = order;

			var revYear = this.revYear,
			revScore = this.revScore,
			revRecent = this.revRecent;

			if (order == 2) {
				revScore = !revScore;
				revYear = true;
				revRecent = true;
			} else if (order == 3) {
				revRecent = !revRecent;
				revYear = true;
				revScore = true;
			} else {
				revYear = !revYear;
				revScore = true;
				revRecent = true;
			}
		},
		// 点击切换激活状态；若选中则添加到筛选信息中，否则从中删除
		filterActive (item) {
			item.isActive = !item.isActive;

			var searchText = this.searchText,
			activeTags = this.activeTags;

			if (item.isActive) {
				searchText = '';
				activeTags.push(item.tag);
			} else {
				var atIndex = activeTags.indexOf(item.tag);
				activeTags.splice(atIndex, 1);
			}
		},
		// 清空所有选中的标签
		clearTags () {
			var i, len,
			tags = this.tags;

			for (i = 0, len = tags.length; i < len; i++) {
				tags[i].isActive = false;
			}
		},
		// 不同分数级别显示不同颜色
		scoreColor (item) {
			if (item.score >= 9) {
				return '#912CEE';
			}
			else if (item.score < 9 && item.score >= 8) {
				return '#0000CD';
			}
			else if (item.score < 8 && item.score >= 7) {
				return '#00CDCD';
			}
			else if (item.score < 7 && item.score >= 6) {
				return '#00CD00';
			}
			else if (item.score < 6 && item.score >= 5) {
				return '#CDCD00';
			}
			else if (item.score < 5 && item.score >= 4) {
				return '#CD8500';
			}
			else {
				return '#CD0000';
			}
		},
	},
	computed: {
		// 排序：年份/评分/更新
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
		// 过滤：类型标签/搜索文本
		filterFilms () {
			var searchText = this.searchText,
			activeTags = this.activeTags,
			tags = this.tags;

			return this.sortFilms.filter(function (item) {
				// 标签过滤
				if (activeTags.length > 0) {
					// 不完全匹配：遍历每一个标签，只要包含一个就返回
					var i, lenI;
					for (i = 0, lenI = activeTags.length; i < lenI; i++) {
						return item.type.includes(activeTags[i]);
					}
				// 搜索过滤
				} else if (searchText.length > 0) {
					// 不完全匹配：将搜索文本分割为每个字，只要包含一个就返回
					var stArr = searchText.replace(/\s*/g, '').split(''),
					j, lenJ,
					k, lenK;

					for (j = 0, lenJ = stArr.length; j < lenJ; j++) {
						for (k = 0, lenK = item.length; k < lenK; k++) {
							return item[k].toLowerCase().includes(stArr[j].toLowerCase());
						}
					}
				} else {
					return true;
				}
			});
		},
	},
	watch: {
		// 搜索时清空标签
		searchText () {
			if (this.searchText.length > 0) {
				this.clearTags();
			}
		}
	}
});

var footer = new Vue({
	el: '#footer',
	data: {
		pageOrder: 1,
	},
});