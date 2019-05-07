// 利用js计算当前设备的DPR，动态设置html的font-size，利用css的选择器根据DPR来设置不同DPR下的字体大小
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

// 主要jquery脚本
$(function () {
	// 给json地址添加随机参数
	var date = new Date();
	var reUrl = "http://192.168.199.126:8080/movies/movies.json?t=" + date.getTime();
	// 首次加载数据
	loadData();
	function loadData() {
		$.ajax({
			url: reUrl,
			type: "GET",
			async: false,
			dataType: "json",
			success (result) {
				vm.films = result;
				$("#loadingBg").remove();
			},
			error () {
				$("#loadingInfo").html("<img src='error.png'><br><br><span>加载失败！</span><br><br><button type='button' class='btn btn-outline-primary'>重新加载</button>");
			}
		});
	}
	// 重新加载数据
	$("#loadingInfo button").click(function () {
		loadData();
	});

	// 折叠面板
	$(".screenToggler").click(function () {
		$(".screenToggler").toggleClass("togglerColor");
	});
	$("#screenCollapse").on('hidden.bs.collapse', function () {
		$(".searchInput").removeClass("inputTransition");
		$("#searchButton").css("color", "#A9A9A9");
		$("#searchButton").attr("type", "button");
	});
	// 排序按钮
	$("[name='sort']").click(function () {
		$(this).addClass("active");
		$("[name='sort']:not(:focus)").removeClass("active");
	});
	// 搜索框
	var si = $(".searchInput");
	$("#searchButton").click(function () {
		if (!si.hasClass("inputTransition")) {
			$(this).css("color", "#363636");
			si.addClass("inputTransition");
		} else {
			$(this).attr("type", "submit");
		}
	});
	// 点击其他位置收起
	$(".tab-content, .bottomDivider, .shortCut, .footNav").click(function () {
		if (si.val()) {
			$("#screenCollapse").collapse('hide');
		} else {
			$("#screenCollapse").collapse('hide');
			$(".searchInput").removeClass("inputTransition");
			$("#searchButton").css("color", "#A9A9A9");
			$("#searchButton").attr("type", "button");
		}
	});
	
	// 更新数据并显示状态
	function reloadData() {
		$("#reloadDivider").animate({ marginTop: "3rem" }, "fast", function () {
			$.get(reUrl, function (data, status) {
				if (status == "success") {
					vm.films = data;
					$("#reloadDivider").html("<hr>&nbsp;&nbsp; 更新成功 <i class='fas fa-check-circle'></i> &nbsp;&nbsp;<hr>");
				} else if (status == "notmodified") {
					$("#reloadDivider").html("<hr>&nbsp;&nbsp; 没有更新 <i class='fas fa-minus-circle'></i> &nbsp;&nbsp;<hr>");
				} else {
					$("#reloadDivider").html("<hr>&nbsp;&nbsp; 更新失败 <i class='fas fa-exclamation-circle'></i> &nbsp;&nbsp;<hr>");
				}
			}, "json");
		});
		setTimeout(function () {
			$("#reloadDivider").animate({ marginTop: "0.4rem" }, "slow", function () {
				$("#reloadDivider").html("<hr>&nbsp;&nbsp; 正在更新 <i class='fas fa-sync-alt'></i> &nbsp;&nbsp;<hr>");
			});
		}, 100);
	}

	// 滚动到顶部
	$("#toTop").click(function () {
		$('html, body').animate({ scrollTop: 0 }, "slow");
	});
	// 更新按钮
	$("#reLoad").click(function () {
		$('html, body').animate({ scrollTop: 0 }, "fast", reloadData);
	});
	// 滚动到底部
	$("#toBottom").click(function () {
		$('html, body').animate({ scrollTop: $(document).height() }, "slow");
	});
});

// vue实例
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
		// 过滤，排序
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
		// 分数分级显示不同颜色
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