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