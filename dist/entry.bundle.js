/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var tsg = __webpack_require__(1);
var res = 500;
var sides = 3;
var radius = 80;
var rot_offset = -1.5 * Math.PI / 3;
var x_offset = 0;
var color = "orange";
var sec_per_rev = 3;
var min = Math.min;
var max = Math.max;
function within(l, x, h) {
    return (l <= x && x <= h) || (h <= x && x < l);
}
function intersect(a, b) {
    if (a.w == 0 && b.w == 0)
        return undefined;
    if (!(a.w == 0 || b.w == 0) && a.h / a.w == b.h / b.w)
        return undefined;
    if (a.w == 0) {
        var Fb = function (x) { return (b.h / b.w) * x + (b.y - (b.x * b.h / b.w)); };
        if ((within(a.y, Fb(a.x), a.y + a.h) || a.isInfinite) && (within(b.x, a.x, b.x + b.w) || a.isInfinite))
            return [a.x, Fb(a.x)];
        else
            return undefined;
    }
    else if (b.w == 0) {
        var Fa = function (x) { return (a.h / a.w) * x + (a.y - (a.x * a.h / a.w)); };
        if ((within(b.y, Fa(b.x), b.y + b.h) || b.isInfinite) && (within(a.x, b.x, a.x + a.w) || b.isInfinite))
            return [b.x, Fa(b.x)];
        else
            return undefined;
    }
    else {
        var Sa = a.h / a.w;
        var Ma = a.y - a.x * a.h / a.w;
        var Sb = b.h / b.w;
        var Mb = b.y - b.x * b.h / b.w;
        var Fb = function (x) { return (b.h / b.w) * x + (b.y - (b.x * b.h / b.w)); };
        var Px = (Ma - Mb) / (Sb - Sa);
        if ((within(a.x, Px, a.x + a.w) || a.isInfinite) && (min(b.x, b.x + b.w) <= Px && Px <= max(b.x, b.x + b.w) || b.isInfinite))
            return [Px, Fb(Px)];
        else
            return undefined;
    }
}
function R(p1, p2) {
    return { x: p1.x, y: p1.y, w: p2.x - p1.x, h: p2.y - p1.y };
}
function raycast(origin, direction, shape) {
    var particle = origin;
    var out = [];
    for (var i = 0; i < shape.length - 1; i++) {
        var col = intersect(R(shape[i], shape[i + 1]), R(origin, { x: origin.x + 120 * direction.x, y: origin.y + 120 * direction.y }));
        if (col) {
            out.push({
                point: { x: col[0], y: col[1] },
                seg: R(shape[i], shape[i + 1])
            });
        }
    }
    return out;
}
;
function I(a, b, i) {
    return a + (b - a) * i;
}
var MyScene = {
    setup: function () {
        this.shape = [];
        for (var s = 0; s < sides; s++)
            for (var i = 0; i < 1; i += sides / res) {
                var sx = 100 + radius * Math.cos(rot_offset - s / sides * 2 * Math.PI);
                var sy = 100 + radius * Math.sin(rot_offset - s / sides * 2 * Math.PI);
                var ex = 100 + radius * Math.cos(rot_offset - (s + 1) / sides * 2 * Math.PI);
                var ey = 100 + radius * Math.sin(rot_offset - (s + 1) / sides * 2 * Math.PI);
                this.shape.push({
                    x: x_offset + I(sx, ex, i),
                    y: I(sy, ey, i)
                });
            }
        this.curves = [];
    },
    update: function (ctx, time, size) {
        ctx.clearRect(0, 0, size.width, size.height);
        ctx.strokeStyle = "lightGray";
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(0, 20);
        ctx.lineTo(size.width, 20);
        ctx.moveTo(0, 100);
        ctx.lineTo(size.width, 100);
        ctx.moveTo(0, 180);
        ctx.lineTo(size.width, 180);
        ctx.moveTo(20, 0);
        ctx.lineTo(20, size.height);
        ctx.moveTo(100, 0);
        ctx.lineTo(100, size.height);
        ctx.moveTo(180, 0);
        ctx.lineTo(180, size.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(200, 0);
        ctx.lineTo(200, size.height);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (var _i = 0, _a = this.shape; _i < _a.length; _i++) {
            var point = _a[_i];
            if (point.x == undefined) {
                ctx.stroke();
                ctx.beginPath();
                continue;
            }
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(100, 100, 3, 0, 2 * Math.PI);
        ctx.fill();
        var sx = 100 + radius * Math.cos(rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var sy = 100 + radius * Math.sin(rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var ex = 100 + radius * Math.cos(rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var ey = 100 + radius * Math.sin(rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + 120 * Math.cos(-time.elapsed * 2 * Math.PI / sec_per_rev), 100 + 120 * Math.sin(-time.elapsed * 2 * Math.PI / sec_per_rev));
        ctx.stroke();
        ctx.strokeStyle = color;
        var collisions = raycast({ x: 100, y: 100 }, {
            x: Math.cos(-time.elapsed * 2 * Math.PI / sec_per_rev),
            y: Math.sin(-time.elapsed * 2 * Math.PI / sec_per_rev)
        }, this.shape);
        for (var i = 0; i < collisions.length; i++) {
            var seg = collisions[i].seg;
            var point = collisions[i].point;
            var tx = point.x;
            var ty = point.y;
            ctx.beginPath();
            ctx.arc(tx, ty, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(200, ty, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(200, ty);
            ctx.stroke();
            if (!this.curves[i])
                this.curves[i] = [];
            this.curves[i].push({ x: 200, y: ty });
        }
        if (collisions.length == 0) {
            this.curves.map(function (C) { return C.push({ x: undefined, y: undefined }); });
        }
        ctx.lineWidth = 3;
        for (var i in this.curves) {
            var curve = this.curves[i];
            ctx.beginPath();
            for (var _b = 0, curve_1 = curve; _b < curve_1.length; _b++) {
                var j = curve_1[_b];
                if (j.x == undefined) {
                    ctx.stroke();
                    ctx.beginPath();
                    continue;
                }
                ctx.lineTo(j.x, j.y);
                j.x += 150 * time.delta;
            }
            ctx.stroke();
        }
        for (var i = 0; i < this.curves[0]; i++) {
            if (this.curves[0][i].x >= size.width) {
                this.curves = this.curves.map(function (C) { return C.splice(i + 1); });
                break;
            }
        }
    },
    mousedown: function (ev) {
        this.shape.push({ x: undefined, y: undefined });
    },
    mousemove: function (ev) {
        if (ev.buttons) {
            this.shape.push({ x: ev.offsetX, y: ev.offsetY });
        }
    },
    overlayUI: function (dom) {
    },
    button: function (text, action) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML = text;
        btn.onclick = action;
        btn.classList = "btn btn-light";
        btn.style.margin = "5px";
        this.dom.appendChild(btn);
    },
    ui: function (dom) {
        this.dom = dom;
        this.button("&#x007C;", (function () {
            res = 500;
            sides = 2;
            radius = 80;
            rot_offset = Math.PI / 2;
            x_offset = 10;
            color = "purple";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("&#x2571;", (function () {
            res = 500;
            sides = 2;
            radius = 80;
            rot_offset = Math.PI / 4;
            x_offset = 10;
            color = "pink";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("&#x25b3;", (function () {
            res = 500;
            sides = 3;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "orange";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("&#8414;", (function () {
            res = 500;
            sides = 4;
            radius = 80 * Math.SQRT2;
            rot_offset = Math.PI / 4;
            x_offset = 0;
            color = "blue";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("&#x2b21;", (function () {
            res = 500;
            sides = 6;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "green";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("&#9711;", (function () {
            res = 500;
            sides = 100;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "red";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
        this.button("clear", (function () {
            res = 500;
            sides = 0;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = -100;
            color = "black";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));
    }
};
tsg.run(MyScene, { w: 0, h: 200 }, 2.4);
//# sourceMappingURL=scene.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ })
/******/ ]);