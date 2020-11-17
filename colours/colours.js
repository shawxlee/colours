$(function() {
    $("a").click(function() {
        window.location.reload();
    });
    $("#changeColor").click(function(event) {
        var icVal = $("#inputColor").val();

        function testPatt(v) {
            var patt = /^#([0-9]|[a-zA-Z]){6}$/;
            return patt.test(v);
        };
        if (testPatt(icVal)) {
            $("#currentColor").text(icVal);
            $("#currentColor").css("color", icVal);
            $("body").css({
                "background-color": icVal,
                "color": icVal,
            });
            $("td").css("border-color", icVal);
        } else {
            $("input").css("background-color", "red");
        };
        event.stopPropagation();
    });
    $("#inputColor").focus(function() {
        $("input").css("background-color", "");
    });
    $(document).click(function() {
        $("input").css("background-color", "");
    });
});