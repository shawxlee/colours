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
		console.warn("将根据已有的meta标签来设置缩放比例");
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
	errorInfo = $("#errorInfo");

	function loadData() {
		$.ajax({
			url: reUrl,
			type: "GET",
			async: false,
			dataType: "json",
			success (result) {
				all.films = result;
				loadingBg.remove();
			},
			error () {
				loadingInfo.hide();
				errorInfo.show();
			}
		});
	}

	// 首次加载数据
	loadData();

	// 重新加载数据
	var loadAgain = $("#loadAgain");

	loadAgain.click(function () {
		errorInfo.hide();
		loadingInfo.show();
		loadData();
	});

	// 搜索框
	var searchInput = $("#searchInput"),
	searchButton = $("#searchButton");

	searchButton.click(function () {
		if ($(this).hasClass("active")) {
			$(this).prop("type", "submit");
		} else {
			$(this).addClass("active");
			searchInput.animate({ opacity: 1, width: "100%" }, 100, "linear");
		}
	});

	// 折叠面板
	var screenCollapse = $("#screenCollapse"),
	screenToggler = $("#screenToggler");

	screenCollapse.on('show.bs.collapse hidden.bs.collapse', function () {
		screenToggler.toggleClass("active");
	});
	screenCollapse.on('hidden.bs.collapse', function () {
		searchInput.animate({ width: "15%", opacity: 0 }, 100, "linear");
		searchButton.removeClass("active").prop("type", "button");
	});

	// 点击其他位置收起
	var notHeader = $("#detailMode, #seriesMode, #miniMode, #bottomDivider, #toTop, #toBottom, #footer");

	notHeader.click(function () {
		if (searchInput.val()) {
			screenCollapse.collapse('hide');
		} else {
			screenCollapse.collapse('hide');
			searchInput.animate({ width: "15%", opacity: 0 }, 100, "linear");
			searchButton.removeClass("active").prop("type", "button");
		}
	});
	
	// 更新数据并显示状态
	var topDivider = $("#topDivider"),
	isReloading = $("#isReloading"),
	reloadSuccess = $("#reloadSuccess"),
	notModified = $("#notModified"),
	reloadError = $("#reloadError");

	function reloadData() {
		$.get(reUrl, function (data,status) {
			if (status == "success") {
				all.films = data;
				isReloading.hide();
				reloadSuccess.show();
				topDivider.removeClass("pull").addClass("fold");
			} else if (status == "notmodified") {
				isReloading.hide();
				notModified.show();
				topDivider.removeClass("pull").addClass("fold");
			} else {
				isReloading.hide();
				reloadError.show();
				topDivider.removeClass("pull").addClass("fold");
			}
		}, "json");
	}

	// 页面滚动条
	var htmlBody = $("html, body"),
	toTop = $("#toTop"),
	toBottom = $("#toBottom"),
	toAll = $("#toAll");
	// 滚动到顶部
	toTop.click(function () {
		htmlBody.animate({ scrollTop: 0 }, 300, "linear");
	});
	// 滚动到底部
	toBottom.click(function () {
		htmlBody.animate({ scrollTop: $(document).height() }, 300, "linear");
	});
	// 滚动到顶部并刷新
	toAll.click(function () {
		htmlBody.animate({ scrollTop: 0 }, 100, "linear", function () {
			topDivider.removeClass("fold").addClass("pull");
			reloadData();
			if (topDivider.css("margin-top") == ".3rem") {
				isReloading.show();
				reloadSuccess.hide();
				notModified.hide();
				reloadError.hide();
			}
		});
	});
});

// vue实例
var all = new Vue({
	el: '#all',
	data: {
		sortOrder: 1,
		revYear: false,
		revScore: true,
		revRecent: true,
		tags: [
		{
			isActive: false,
			tag: '犯罪'
		},
		{
			isActive: false,
			tag: '感染'
		},
		{
			isActive: false,
			tag: '怪物'
		},
		{
			isActive: false,
			tag: '鬼神'
		},
		{
			isActive: false,
			tag: '恐怖'
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
			tag: '人性'
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
			tag: '时空'
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
			tag: '血腥'
		},
		{
			isActive: false,
			tag: '灾难'
		},
		{
			isActive: false,
			tag: '冒险'
		},
		{
			isActive: false,
			tag: '科幻'
		}
		],
		films: [],
	},
	computed: {
		// 排序，过滤
		sortFilter () {
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
	},
	methods: {
		// 点击不同按钮切换排序方式，点击同一按钮切换正倒序
		sortActive (n) {
			this.sortOrder = n;
			if (n == 2) {
				var rs = this.revScore;
				rs = !rs;
				this.revScore = rs;

				this.revYear = true;
				this.revRecent = true;
			} else if (n == 3) {
				var rr = this.revRecent;
				rr = !rr;
				this.revRecent = rr;

				this.revYear = true;
				this.revScore = true;
			} else {
				var ry = this.revYear;
				ry = !ry;
				this.revYear = ry;

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