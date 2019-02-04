"use strict";
exports.__esModule = true;
exports.run = function (scene, size, quality) {
    var width, height;
    function setCanvasDimensions() {
        if (size.w == 0)
            width = document.body.clientWidth;
        else
            width = size.w;
        if (size.h == 0)
            height = document.body.clientHeight;
        else
            height = size.h;
        canvas.width = res * width;
        canvas.height = res * height;
    }
    var cumulativeOffset = function (element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return {
            top: top,
            left: left
        };
    };
    function anim() {
        ctx.save();
        ctx.scale(res, res);
        scene.update(ctx, { elapsed: (Date.now() - initTime) / 1000, delta: (Date.now() - prevTime) / 1000 }, { width: width, height: height });
        ctx.restore();
        prevTime = Date.now();
        window.requestAnimationFrame(anim);
    }
    var canvas = document.createElement("canvas");
    canvas.id = "mainCanvas";
    if (size.w)
        canvas.style.width = size.w + "px";
    else
        canvas.style.width = "100%";
    if (size.h)
        canvas.style.height = size.h + "px";
    else
        canvas.style.height = "100%";
    document.body.appendChild(canvas);
    var overlay = document.createElement("div");
    overlay.style.width = canvas.style.width;
    overlay.style.height = canvas.style.height;
    overlay.style.position = "absolute";
    var offset = cumulativeOffset(canvas);
    overlay.style.top = offset.top + "px";
    overlay.style.left = offset.left + "px";
    overlay.style.width = canvas.offsetWidth + "px";
    overlay.style.height = canvas.offsetHeight + "px";
    overlay.style.overflow = "scroll";
    document.body.appendChild(overlay);
    var res = quality;
    window.addEventListener('resize', setCanvasDimensions);
    setCanvasDimensions();
    var ctx = canvas.getContext('2d');
    scene.setup();
    scene.overlayUI(overlay);
    scene.ui(document.body);
    var initTime = Date.now();
    var prevTime = Date.now();
    window.requestAnimationFrame(anim);
    for (var i in window) {
        if (i.substring(0, 2) == "on") {
            var eventName = i.substring(2);
            if (scene[eventName])
                document.body.addEventListener(eventName, scene[eventName].bind(scene));
        }
    }
};
//# sourceMappingURL=tsg.js.map