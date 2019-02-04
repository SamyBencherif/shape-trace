

export var run = function (scene: Scene, size: { w: number, h: number }, quality: number) {

	var width: number, height: number;

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

	var cumulativeOffset = function (element: HTMLElement) {
		var top = 0, left = 0;
		do {
			top += element.offsetTop || 0;
			left += element.offsetLeft || 0;
			element = element.offsetParent as HTMLElement;
		} while (element);

		return {
			top: top,
			left: left
		};
	};

	function anim() {
		ctx.save();
		ctx.scale(res, res);
		scene.update(ctx, { elapsed: (Date.now() - initTime) / 1000, delta: (Date.now() - prevTime) / 1000 }, { width, height });
		ctx.restore();
		prevTime = Date.now();
		window.requestAnimationFrame(anim);
	}

	//let canvas = document.getElementById('mainCanvas') as HTMLCanvasElement;

	const canvas = document.createElement("canvas");
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

	//if user code has overlay
	const overlay = document.createElement("div");
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

	let res = quality;

	window.addEventListener('resize', setCanvasDimensions);
	setCanvasDimensions();

	let ctx: CanvasRenderingContext2D = canvas.getContext('2d');

	scene.setup();
	scene.overlayUI(overlay);
	scene.ui(document.body);

	let initTime: number = Date.now();
	let prevTime: number = Date.now();

	window.requestAnimationFrame(anim);


	//Add event delegates
	for (var i in window) {
		if (i.substring(0, 2) == "on") {
			var eventName = i.substring(2)
			if (scene[eventName])
				document.body.addEventListener(eventName, scene[eventName].bind(scene));
		}
	}

	/*
	// keyboard
	if (scene.keydown)
		document.body.addEventListener('keydown', scene.keydown.bind(scene));
	if (scene.keyup)
		document.body.addEventListener('keyup', scene.keyup.bind(scene));

	// mouse buttons

	if (scene.mousedown)
		document.body.addEventListener('mousedown', scene.mousedown.bind(scene));
	if (scene.mouseup)
		document.body.addEventListener('mouseup', scene.mouseup.bind(scene));

	// mouse movements
	if (scene.mousemove)
		document.body.addEventListener('mousemove', scene.mousemove.bind(scene));
	if (scene.mousewheel)
		document.body.addEventListener('mousewheel', scene.mousewheel.bind(scene));
	*/
}

export interface Time {
	elapsed: number,
	delta: number
}

export interface Size {
	width: number,
	height: number
}

export interface Scene {
	[key: string]: Function;
	setup(): void
	update(ctx: CanvasRenderingContext2D, time: Time, size: Size): void
	overlayUI?(dom: HTMLElement): void
	ui?(dom: HTMLElement): void

	// some commonly used events (included for hints)
	keydown?(ev: KeyboardEvent): void
	keyup?(ev: KeyboardEvent): void
	mousedown?(ev: MouseEvent): void
	mouseup?(ev: MouseEvent): void
	mousemove?(ev: MouseEvent): void
	mousewheel?(ev: WheelEvent): void
}
