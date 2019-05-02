$(function () {
	$.ajax({
		url: "movies.json",
		type: "GET",
		async: false,
		data: {},
		dataType: "json",
		success: function (data) {
			vm.films = data;
		}
	});
	$("#filterCollapse").on('show.bs.collapse', function () {
		$("#filterToggler").css("color", "#4F4F4F");
	});
	$('#filterCollapse').on('hidden.bs.collapse', function () {
		$("#filterToggler").css("color", "#A9A9A9");
	});
	$("#filmList").click(function () {
		$("#filterCollapse").collapse('hide');
	});
	$("button[name='sort']").click(function () {
		if (!$(this).hasClass("chosen")) {
			$(this).addClass("chosen");
			$(":not(:focus)").removeClass("chosen");
		}
	});
	$("#searchButton").click(function (event) {
		var sb = $("#searchButton");
		var si = $("#searchInput");
		if (!si.hasClass("inputTransition")) {
			sb.css("color", "#4F4F4F");
			si.addClass("inputTransition");
		} else {
			sb.attr("type", "submit");
		}
		event.stopPropagation();
	});
	$("#headNavbar").click(function(){
		$("#searchInput").removeClass("inputTransition");
		$("#searchButton").css("color", "#A9A9A9");
	});
	$("#searchInput").click(function (event) {
		event.stopPropagation();
	});

	$("#sidebarToggler").click(function () {
		var ss = $("#settingSidebar");
		if (!ss.hasClass("sidebarTransition")) {
			ss.addClass("sidebarTransition");
		} else {
			ss.removeClass("sidebarTransition");
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
		films: [],
		sortOrder: 0,
	},
	computed: {
		filterFilms () {
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
	},
	methods: {
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