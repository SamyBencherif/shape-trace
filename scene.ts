
import * as tsg from "./tsg";
import { knownExtended } from "tar";

var res = 500;
var sides = 3;
var radius = 80;
var rot_offset = -1.5 * Math.PI / 3;
var x_offset = 0; //Math.PI / 4;
var color = "orange";
var sec_per_rev = 3;

// some code ported from python

var min = Math.min;
var max = Math.max;

function within(l, x, h) {
    return (l <= x && x <= h) || (h <= x && x < l)
}

function intersect(a, b) {

    // console.log(a, b)
    //If there are zero or infinitely many solutions return undefined
    if (a.w == 0 && b.w == 0)
        return undefined
    if (!(a.w == 0 || b.w == 0) && a.h / a.w == b.h / b.w)
        return undefined

    if (a.w == 0) {
        var Fb = function (x) { return (b.h / b.w) * x + (b.y - (b.x * b.h / b.w)) }
        if ((within(a.y, Fb(a.x), a.y + a.h) || a.isInfinite) && (within(b.x, a.x, b.x + b.w) || a.isInfinite))
            return [a.x, Fb(a.x)]
        else
            return undefined
    }
    else if (b.w == 0) {
        var Fa = function (x) { return (a.h / a.w) * x + (a.y - (a.x * a.h / a.w)) }
        if ((within(b.y, Fa(b.x), b.y + b.h) || b.isInfinite) && (within(a.x, b.x, a.x + a.w) || b.isInfinite))
            return [b.x, Fa(b.x)]
        else
            return undefined
    }
    else {

        //slope
        var Sa = a.h / a.w
        // y intercept
        var Ma = a.y - a.x * a.h / a.w

        var Sb = b.h / b.w
        var Mb = b.y - b.x * b.h / b.w

        // (ay-ax.Sa + bx.Sb-by) / (Sb-Sa)
        var Fb = function (x) { return (b.h / b.w) * x + (b.y - (b.x * b.h / b.w)); }
        var Px = (Ma - Mb) / (Sb - Sa)
        //within last one
        if ((within(a.x, Px, a.x + a.w) || a.isInfinite) && (min(b.x, b.x + b.w) <= Px && Px <= max(b.x, b.x + b.w) || b.isInfinite))
            return [Px, Fb(Px)]
        else
            return undefined
    }
}

// rectangulate
function R(p1, p2) {
    return { x: p1.x, y: p1.y, w: p2.x - p1.x, h: p2.y - p1.y }
}

function raycast(origin, direction, shape) {
    var particle = origin;
    var out = [];

    for (var i = 0; i < shape.length - 1; i++) {
        var col = intersect(
            R(shape[i], shape[i + 1]),
            R(origin, { x: origin.x + 120 * direction.x, y: origin.y + 120 * direction.y })
        );
        if (col) {
            out.push({
                point: { x: col[0], y: col[1] },
                seg: R(shape[i], shape[i + 1])
            });
        }
    }

    return out;
};

// linear interpolate
function I(a, b, i) {
    return a + (b - a) * i
}

function whatsnew(reporter) {
    var request = new XMLHttpRequest();
    request.open('GET', '/whatsnew.txt', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = request.responseText;

            reporter(resp)
        } else {
            // We reached our target server, but it returned an error
            reporter("")
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        reporter("")
    };

    request.send();
}

function saveVersion(setter) {
    var request = new XMLHttpRequest();
    request.open('GET', '/version.txt', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = request.responseText;

            setter(resp)
        } else {
            // We reached our target server, but it returned an error
            setter("unknown")
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        setter("unknown")
    };

    request.send();
}

let MyScene: tsg.Scene = {

    setup: function () {

        this.current = "unknown";
        this.latest = "unknown";

        this.checkUpdateClock = 0;

        saveVersion((v) => this.current = v);
        saveVersion((v) => this.latest = v);
        saveVersion((v) => console.log("Running Version " + v));

        this.shape = [];

        for (var s = 0; s < sides; s++)
            for (var i = 0; i < 1; i += sides / res) {
                var sx = 100 + radius * Math.cos(rot_offset - s / sides * 2 * Math.PI);
                var sy = 100 + radius * Math.sin(rot_offset - s / sides * 2 * Math.PI);
                var ex = 100 + radius * Math.cos(rot_offset - (s + 1) / sides * 2 * Math.PI);
                var ey = 100 + radius * Math.sin(rot_offset - (s + 1) / sides * 2 * Math.PI);
                this.shape.push(
                    {
                        x: x_offset + I(sx, ex, i),
                        y: I(sy, ey, i)
                    }
                )
            }

        this.curves = [];
    },

    update: function (ctx: CanvasRenderingContext2D, time: tsg.Time, size: tsg.Size): void {

        if (this.checkUpdateClock != undefined)
            this.checkUpdateClock += time.delta;

        if (this.checkUpdateClock > 5) {

            if (this.latest != this.current) {

                whatsnew((function (info) {
                    if (confirm("A new version is available! Continue to update." + (info ? "\n\n Whats New: \n" + info : ""))) {
                        location.reload(true);
                    }
                    this.checkUpdateClock = undefined; //decommission
                    console.log("update deferred.")
                }).bind(this));
            } else {
                this.checkUpdateClock = 0;
            }

            saveVersion((v) => this.latest = v);
        }

        ctx.clearRect(0, 0, size.width, size.height);
        ctx.strokeStyle = "lightGray";

        // I chose literally the stupidest way to draw the grid
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
        ctx.beginPath()
        ctx.lineWidth = 2;
        ctx.moveTo(200, 0);
        ctx.lineTo(200, size.height);
        ctx.stroke()

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        ctx.beginPath();
        for (var point of this.shape) {
            if (point.x == undefined) {
                ctx.stroke()
                ctx.beginPath()
                continue
            }

            ctx.lineTo(
                point.x,
                point.y
            );

            if (color == "black") {
                ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
            }
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(100, 100, 3, 0, 2 * Math.PI);
        ctx.fill();

        var sx = 100 + radius * Math.cos(
            rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI
        );
        var sy = 100 + radius * Math.sin(
            rot_offset - Math.floor(sides * time.elapsed / 3) / sides * 2 * Math.PI
        );
        var ex = 100 + radius * Math.cos(
            rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI
        );
        var ey = 100 + radius * Math.sin(
            rot_offset - Math.ceil(sides * time.elapsed / 3) / sides * 2 * Math.PI
        );

        // linear trace shape
        // var tx = this.shape[Math.round(res * time.elapsed / sec_per_rev) % this.shape.length].x;
        // var ty = this.shape[Math.round(res * time.elapsed / sec_per_rev) % this.shape.length].y;

        ctx.strokeStyle = "red";

        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + 120 * Math.cos(-time.elapsed * 2 * Math.PI / sec_per_rev),
            100 + 120 * Math.sin(-time.elapsed * 2 * Math.PI / sec_per_rev));
        ctx.stroke();
        ctx.strokeStyle = color;


        var collisions = raycast(
            { x: 100, y: 100 },
            {
                x: Math.cos(-time.elapsed * 2 * Math.PI / sec_per_rev),
                y: Math.sin(-time.elapsed * 2 * Math.PI / sec_per_rev)
            },
            this.shape
        );


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
            this.curves[i].push({ x: 200, y: ty })
        }

        if (collisions.length == 0) {
            this.curves.map(C => C.push({ x: undefined, y: undefined }));
        }

        ctx.lineWidth = 3;
        for (var i in this.curves) {

            var curve = this.curves[i];

            ctx.beginPath();

            for (var j of curve) {
                if (j.x == undefined) {
                    ctx.stroke()
                    ctx.beginPath()
                    continue
                }


                ctx.lineTo(j.x, j.y);
                j.x += 150 * time.delta;
            }
            ctx.stroke();
        }

        for (var i = 0; i < this.curves[0]; i++) {
            if (this.curves[0][i].x >= size.width) {
                this.curves = this.curves.map((C) => C.splice(i + 1));
                break;
            }
        }

    },

    mousedown: function (ev: MouseEvent) {
        // this.shape.push({ x: undefined, y: undefined });
        if (color == "black") {
            if (this.shape.length == 0)
                this.shape.push({ x: ev.offsetX, y: ev.offsetY });
            this.shape.push({ x: ev.offsetX, y: ev.offsetY });
        }

    },
    mousemove: function (ev: MouseEvent) {
        if (color == "black")

            if (ev.buttons) {
                this.shape[this.shape.length - 1] = { x: ev.offsetX, y: ev.offsetY };
            }
    },

    overlayUI: function (dom: HTMLElement) {
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

    ui: function (dom: HTMLElement) {
        this.dom = dom;

        // line (purple)
        this.button("&#x007C;", (function () {
            res = 500;
            sides = 2;
            radius = 80;
            rot_offset = Math.PI / 2; //Math.PI / 4;
            x_offset = 10; //Math.PI / 4;
            color = "purple";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

        // slant (pink)
        this.button("&#x2571;", (function () {
            res = 500;
            sides = 2;
            radius = 80;
            rot_offset = Math.PI / 4;
            x_offset = 10; //Math.PI / 4;
            color = "pink";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

        // triangle (orange)
        this.button("&#x25b3;", (function () {
            res = 500;
            sides = 3;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0; //Math.PI / 4;
            color = "orange";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

        // square (blue)
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

        // hexagon (green)
        this.button("&#x2b21;", (function () {
            res = 500;
            sides = 6;
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0; //Math.PI / 4;
            color = "green";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

        // circle (red)
        this.button("&#9711;", (function () {
            res = 500;
            sides = 100;  //fuck ton polygon = circle right?
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = 0; //Math.PI / 4;
            color = "red";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

        this.button("clear", (function () {
            res = 500;
            sides = 0;  // v o i d   p o l y g o n
            radius = 80;
            rot_offset = -1.5 * Math.PI / 3;
            x_offset = -100; //Math.PI / 4;
            color = "black";
            sec_per_rev = 3;
            this.setup();
        }).bind(this));

    }

}

tsg.run(MyScene, { w: 0, h: 200 }, 2.4);
