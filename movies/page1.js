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
	// 重新加载数据
	loadAgain.on("click", function () {
		errorInfo.hide();
		loadingInfo.show();
		loadData();
	});

	// 搜索框展开/收起
	var searchToggler = $("#searchToggler"),
	searchInput = $("#searchInput");

	searchToggler.on("click", function () {
		if (all.stretchLeft) {
			all.searchText = "";
		} else {
			all.stretchLeft = true;
			searchInput.focus();
		}
	});
	searchInput.on("focus blur", function () {
		searchToggler.toggleClass("active");
	});

	// 折叠组件：筛选面板
	var screenCollapse = $("#screenCollapse"),
	screenToggler = $("#screenToggler");

	screenCollapse.on("show.bs.collapse hidden.bs.collapse", function () {
		screenToggler.toggleClass("active");
		all.collapseHidden = !all.collapseHidden;
		if (all.activeTags.length != 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});

	// 点击其他位置或滚动时收起
	var notScreen = $("#modeSwitch, #detailMode, #miniMode, #seriesMode, #bottomDivider, #toTop, #toBottom, #footer");

	notScreen.on("click", function () {
		screenCollapse.collapse("hide");
		if (all.searchText.length == 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});
	$(document).on("scroll", function () {
		screenCollapse.collapse("hide");
		if (all.searchText.length == 0) {
			all.stretchLeft = false;
			searchToggler.removeClass("active");
		}
	});
	
	// 更新数据并显示状态
	function foldUp() {
		all.pullDown = false;
		if (!all.pullDown) {
			all.reloadSuccess = false;
			all.notModified = false;
			all.reloadError = false;
		}
	}
	function reloadData() {
		all.isReloading = true;
		all.pullDown = true;
		if (all.pullDown) {
			$.post(reUrl, function (data,status) {
				if (status == "success") {
					if (all.activeTags.length != 0) {
						for (var i = 0, len = all.tags.length; i < len; i++) {
							all.tags[i].isActive = false;
						}
					}
					if (all.searchText.length != 0) {
						all.searchText = "";
					}
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
			setTimeout(foldUp, 100);
		}
	}

	// 页面滚动与刷新
	var htmlBody = $("html, body"),
	toTop = $("#toTop"),
	toBottom = $("#toBottom"),
	toAll = $("#toAll");

	toTop.on("click", function () {
		htmlBody.animate({ scrollTop: 0 }, 300, "linear");
	});
	toBottom.on("click", function () {
		htmlBody.animate({ scrollTop: $(document).height() }, 300, "linear");
	});
	toAll.on("click", function () {
		htmlBody.animate({ scrollTop: 0 }, 100, "linear", reloadData);
	});
});

// vue实例
var all = new Vue({
	el: '#all',
	data: {
		collapseHidden: true,
		stretchLeft: false,
		searchText: '',
		sortOrder: 1,
		revYear: false,
		revScore: true,
		revRecent: true,
		activeTags: [],
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
		pullDown: false,
		isReloading: false,
		reloadSuccess: false,
		notModified: false,
		reloadError: false,
		films: [],
	},
	computed: {
		// 排序
		sortFilms () {
			var so = this.sortOrder,
			ry = this.revYear,
			rs = this.revScore,
			rr = this.revRecent;

			return this.films.sort(function (a,b) {
				if (so == 1 && !ry) {
					return a.year - b.year;
				} else if (so == 2 && !rs) {
					return b.score - a.score;
				} else if (so == 3 && !rr) {
					return b.id - a.id;
				} else if (so == 1 && ry) {
					return b.year - a.year;
				} else if (so == 2 && rs) {
					return a.score - b.score;
				} else {
					return a.id - b.id;
				}
			});
		},
		// 过滤
		filterFilms () {
			var st = this.searchText,
			at = this.activeTags;

			for (var i = 0, len = this.tags.length; i < len; i++) {
				var tItem = this.tags[i];
				if (st.length != 0) {
					tItem.isActive = false;
				} else {
					if (tItem.isActive) {
						at.push(tItem.tag);
					} else {
						if (at.indexOf(tItem.tag) != -1) {
							var atIndex = at.indexOf(tItem.tag);
							at.splice(atIndex, 1);
						}
					}
				}
			}
			if (at.length != 0) {
				st = '';
				// 不完全匹配：type转换为数组，与activeTags嵌套循环，只要含有相同元素的项，都符合条件
				return this.sortFilms.filter(function (item) {
					var newType = item.type.split(' / '),
					i, lenI,
					j, lenJ;

					for (i = 0, lenI = at.length; i < lenI; i++) {
						for (j = 0, lenJ = newType.length; j < lenJ; j++) {
							if (newType[j] == at[i]) {
								return true;
							}
						}
					}
				});
			} else {
				// 不完全匹配：搜索词分割为每个字，与item每一项嵌套循环，只要字符串中包含相同字，都符合条件
				return this.sortFilms.filter(function (item) {
					var newSt = st.replace(/\s*/g, '').split(''),
					i, lenI,
					j, lenJ,
					k, lenK;

					for (i = 0, lenI = newSt.length; i < lenI; i++) {
						for (j = 0, lenJ = item.length; j < lenJ; j++) {
							for (k = 0, lenK = item[j].length; k < lenK; k++) {
								if (item[j][k].toLowerCase().indexOf(newSt[i].toLowerCase()) !== -1) {
									return true;
								}
							}
						}
					}
				});
			}
		},
	},
	methods: {
		// 点击不同按钮切换排序方式，点击同一按钮切换正倒序
		sortActive (order) {
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
		// 不同分数级别显示不同颜色
		scoreColor (item) {
			var is = item.score;
			if (is >= 9) {
				return '#912CEE';
			}
			else if (is < 9 && is >= 8) {
				return '#0000CD';
			}
			else if (is < 8 && is >= 7) {
				return '#00CDCD';
			}
			else if (is < 7 && is >= 6) {
				return '#00CD00';
			}
			else if (is < 6 && is >= 5) {
				return '#CDCD00';
			}
			else if (is < 5 && is >= 4) {
				return '#CD8500';
			}
			else {
				return '#CD0000';
			}
		},
	},
});

var footer = new Vue({
	el: '#footer',
	data: {
		pageOrder: 1,
	},
});