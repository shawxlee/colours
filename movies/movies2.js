$(function () {
	$.ajax({
		url: "movies.json",
		type: "GET",
		async: false,
		dataType: "json",
		success (data) {
			vm.films = data;
			$("#loadingBg").remove();
			$("#topDivider, #detailModel, #miniModel, #seriesModel, #bottomDivider, #shortCut").removeClass("d-none");
		},
		error () {
			$("#loadingInfo").html("<i class='fas fa-exclamation-circle'></i><br><br><span>加载失败！</span>");
		}
	});

	!function (win, lib) {
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

	$("#screenCollapse").on('show.bs.collapse hidden.bs.collapse', function () {
		$("#screenToggler").toggleClass("togglerColor");
	});
	$("#searchButton").click(function () {
		var sb = $("#searchButton");
		var si = $("#searchInput");
		var sf = $("#searchForm");
		if (!si.hasClass("inputTransition")) {
			sb.css("color", "#4F4F4F");
			si.addClass("inputTransition");
			sf.addClass("formTransition");
		} else {
			sb.attr("type", "submit");
		}
	});
	$(".navbar-brand").click(function(){
		$("#searchForm").removeClass("formTransition");
		$("#searchInput").removeClass("inputTransition");
		$("#searchButton").css("color", "#A9A9A9");
		$("#searchButton").attr("type", "button");
	});
	$("#topDivider, #detailModel, #miniModel, #seriesModel, #bottomDivider, #shortCut").click(function () {
		$("#screenCollapse").collapse('hide');
	});

	$("#toTop").click(function () {
		$('html, body').animate({ scrollTop: 0 }, 500, function () {
			// body...
		});
	});
	$("#reLoad").click(function () {
		function getData() {
			$.ajax({
				url: "movies.json",
				type: "GET",
				async: false,
				cache: false,
				dataType: "json",
				success (data) {
					vm.films = data;
					$("#loadingBg").remove();
					$("#topDivider, #detailModel, #miniModel, #seriesModel, #bottomDivider, #shortCut").removeClass("d-none");
				},
				error () {
					$("#loadingInfo").html("<i class='fas fa-exclamation-circle'></i><br><br><span>加载失败！</span>");
				}
			});
		}
	});
});

var vm = new Vue({
	el: '#app',
	data: {
		tags: [
		{ tag: '犯罪' },
		{ tag: '感染' },
		{ tag: '怪物' },
		{ tag: '鬼神' },
		{ tag: '恐怖' },
		{ tag: '猎奇' },
		{ tag: '魔幻' },
		{ tag: '末日' },
		{ tag: '人性' },
		{ tag: '丧尸' },
		{ tag: '烧脑' },
		{ tag: '时空' },
		{ tag: '外星' },
		{ tag: '未来' },
		{ tag: '血腥' },
		{ tag: '灾难' },
		],
		sortOrder: 0,
		films: [],
	},
	methods: {
		filterSort (films) {
			if (this.sortOrder == 1) {
				return this.films.sort(function (a,b) {
					return b.score - a.score;
				});
			} else if (this.sortOrder == 2) {
				return this.films.sort(function (a,b) {
					return b.id - a.id;
				});
			} else {
				return this.films.sort(function (a,b) {
					return a.year - b.year;
				});
			}
		},
		scoreColor (item) {
			if (item.score >= 9) {
				return '#A020F0';
			}
			else if (item.score < 9 && item.score >= 8) {
				return '#0000FF';
			}
			else if (item.score < 8 && item.score >= 7) {
				return '#00FFFF';
			}
			else if (item.score < 7 && item.score >= 6) {
				return '#00FF00';
			}
			else if (item.score < 6 && item.score >= 5) {
				return '#FFFF00';
			}
			else if (item.score < 5 && item.score >= 4) {
				return '#FFA500';
			}
			else {
				return '#FF0000';
			}
		},
	},
});