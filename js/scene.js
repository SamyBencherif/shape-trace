"use strict";
exports.__esModule = true;
var tsg = require("./tsg");
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
function randomColor() {
    var colors = ["red", "green", "blue", '#9f8170', '#af4035', '#e2062c', '#ca2c92', '#93ccea', '#d4af37', '#b5651d', '255', '#fbaed2', '#ff6e4a', '#f0f8ff', '#0ff', '#fff600', '#465945', '#915f6d'];
    return colors[Math.floor(colors.length * Math.random())];
}
function whatsnew(reporter) {
    var request = new XMLHttpRequest();
    request.open('GET', 'whatsnew.txt', true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var resp = request.responseText;
            reporter(resp);
        }
        else {
            reporter("");
        }
    };
    request.onerror = function () {
        reporter("");
    };
    request.send();
}
function saveVersion(setter) {
    var request = new XMLHttpRequest();
    request.open('GET', 'version.txt', true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var resp = request.responseText;
            setter(resp);
        }
        else {
            setter("unknown");
        }
    };
    request.onerror = function () {
        setter("unknown");
    };
    request.send();
}
var MyScene = {
    buildShape: function () {
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
        this.shape.push({
            x: undefined,
            y: undefined
        });
        this.curves = [];
    },
    setup: function () {
        var _this = this;
        this.current = "unknown";
        this.latest = "unknown";
        this.checkUpdateClock = 0;
        saveVersion(function (v) { return _this.current = v; });
        saveVersion(function (v) { return _this.latest = v; });
        saveVersion(function (v) { return console.log("Running Version " + v); });
        this.shape = [];
        this.buildShape();
    },
    update: function (ctx, time, size) {
        var _this = this;
        if (this.checkUpdateClock != undefined)
            this.checkUpdateClock += time.delta;
        if (this.checkUpdateClock > 5) {
            if (this.latest != this.current && this.latest != "unknown" && this.current != "unknown") {
                whatsnew((function (info) {
                    if (confirm("A new version is available! Continue to update." + (info ? "\n\nWhats New: \n" + info : ""))) {
                        location.reload(true);
                    }
                    this.checkUpdateClock = undefined;
                    return;
                    console.log("update deferred.");
                }).bind(this));
            }
            else {
                this.checkUpdateClock = 0;
            }
            saveVersion(function (v) { return _this.latest = v; });
        }
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
            if (color == "black") {
                ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
            }
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(100, 100, 3, 0, 2 * Math.PI);
        ctx.fill();
        var sx = 100 + radius * Math.cos(rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var sy = 100 + radius * Math.sin(rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var ex = 100 + radius * Math.cos(rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        var ey = 100 + radius * Math.sin(rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI);
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
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
        if (ev.target == this.overlay) {
            this.shape.push({ x: undefined, y: undefined });
            if (color == "black") {
                this.shape.push({ x: ev.offsetX, y: ev.offsetY });
                this.shape.push({ x: ev.offsetX, y: ev.offsetY });
            }
        }
    },
    mousemove: function (ev) {
        if (ev.target == this.overlay)
            if (color == "black")
                if (ev.buttons) {
                    this.shape[this.shape.length - 1] = { x: ev.offsetX, y: ev.offsetY };
                }
    },
    overlayUI: function (dom) {
        this.overlay = dom;
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
    dataBlock: function (properties, callback) {
        var block = document.createElement("div");
        block.classList = "card";
        block.style.width = "300px";
        block.style.margin = "5px";
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var prop = properties_1[_i];
            var p = document.createElement("span");
            p.innerText = prop;
            var i = document.createElement("input");
            block.appendChild(p);
            block.appendChild(i);
            i.id = "input_" + prop;
        }
        var submit = document.createElement("input");
        submit.type = "button";
        submit.value = "add shape";
        block.appendChild(submit);
        submit.onclick = (function (ev) {
            var data = [];
            for (var _i = 0, properties_2 = properties; _i < properties_2.length; _i++) {
                var prop = properties_2[_i];
                data.push(block.querySelector('#input_' + prop).value);
            }
            callback.bind(this)(data);
        }).bind(this);
        document.body.appendChild(block);
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
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("&#x2571;", (function () {
            res = 500;
            sides = 2;
            radius = 80;
            rot_offset = Math.PI / 4;
            x_offset = 10;
            color = "pink";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("&#x25b3;", (function () {
            res = 500;
            sides = 3;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "orange";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("&#8414;", (function () {
            res = 500;
            sides = 4;
            radius = 80 * Math.SQRT2;
            rot_offset = Math.PI / 4;
            x_offset = 0;
            color = "blue";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("&#x2b21;", (function () {
            res = 500;
            sides = 6;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "green";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("&#9711;", (function () {
            res = 500;
            sides = 100;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0;
            color = "red";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.button("clear", (function () {
            res = 500;
            sides = 0;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = -100;
            color = "black";
            sec_per_rev = 3;
            this.shape = [];
            this.buildShape();
        }).bind(this));
        this.dataBlock(["sides", "radius", "rotation", "shift"], function (data) {
            sides = parseInt(data[0]);
            radius = parseInt(data[1]);
            rot_offset = Math.PI / 180 * parseInt(data[2]);
            x_offset = parseInt(data[3]);
            color = randomColor();
            this.buildShape();
        });
    }
};
tsg.run(MyScene, { w: 0, h: 200 }, 2.4);
//# sourceMappingURL=scene.js.map