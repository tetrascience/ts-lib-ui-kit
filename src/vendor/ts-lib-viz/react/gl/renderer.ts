/**
 * One WebGL2 context for the page, drawing every chart that asked for the GPU.
 *
 * A browser allows something between eight and sixteen contexts and drops the oldest past that, so
 * a dashboard of thirty charts cannot have one each: plotly's own documentation puts its ceiling at
 * four to eight GL figures a page for this reason. One context draws them all, each into its own
 * scissored slice of a canvas that covers the viewport.
 *
 * The loop is the renderer's, outside React. A layer's buffers are uploaded when its data changes
 * and nothing else, so a zoom moves two uniforms and a hover reads one pixel. React mounts the
 * canvas once and stays out of the frame path.
 */

import {
	cameraFor,
	colorToId,
	packIds,
	scissorFor,
	viewportFor,
	type Packed,
	type Rect,
	type Viewport,
} from "./encode.js";
import {
	AMBIENT,
	cubeMatrix,
	cubeModel,
	eyeOf,
	CUBE_LIGHT,
	normalMatrix,
	restingDepth,
	type Orbit,
} from "../../core/camera.js";
import {POINT_OUTLINE, type PointShape} from "../../core/geom-types.js";
import {
	CUBE_VERTEX,
	LINE_FRAGMENT,
	LINE_VERTEX,
	MESH_FRAGMENT,
	MESH_VERTEX,
	POINT_FRAGMENT,
	POINT_VERTEX,
	SHAPE_CODE,
	VOLUME_FRAGMENT,
	VOLUME_VERTEX,
} from "./shaders.js";

/** What a chart hands the renderer, and what it may change between frames. */
export interface GlLayerInput {
	/** Positions, centered, as `packPositions` returns them. */
	positions: Packed;
	/**
	 * One RGBA byte quadruple per geom.
	 *
	 * Absent means the layer draws in `color` alone, which is four bytes instead of four a geom: at a
	 * hundred million geoms the difference is four hundred megabytes of buffer nobody needed.
	 */
	colors?: Uint8Array;
	/** The layer's one color, as four channels from nought to one. Read where `colors` is absent. */
	color?: readonly [number, number, number, number];
	/** Geom diameter in CSS pixels. Read where `sizes` is absent. */
	size: number;
	/**
	 * One diameter a geom, in CSS pixels, where the size channel binds a column.
	 *
	 * Absent means the layer draws at `size` alone, which is one uniform instead of four bytes a
	 * geom: at ten million the difference is forty megabytes of buffer a fixed-diameter chart never
	 * needed.
	 */
	sizes?: Float32Array;
	shape?: PointShape;
	/**
	 * Draws each glyph as an outline with the page showing through it.
	 *
	 * The footprint is the filled glyph's, so a hollow layer over a filled one covers the same
	 * ground. Picking stays on the footprint too: a pointer aimed at the middle of a ring is aimed
	 * at that geom.
	 */
	hollow?: boolean;
	/**
	 * The third position scale, which turns the layer into a cube.
	 *
	 * Present means the layer draws under a camera the reader turns, on its own program: the flat
	 * program's two-uniform arithmetic stays as it was, and so do the frame numbers measured against
	 * it. Absent draws the flat layer this renderer has always drawn.
	 */
	depth?: DepthInput;
	/**
	 * Triangles over the layer's vertices, which turns the cube's cloud into a surface.
	 *
	 * Needs `depth`, since a triangle wants three coordinates. Present means the layer draws through
	 * the mesh program with a light on it, and the geoms, their diameter and their glyph go unread.
	 */
	mesh?: MeshInput;
	/**
	 * A scalar field read along the ray, which turns the box into a volume.
	 *
	 * Needs `depth` and a `mesh` holding the box's own faces, since the box is the surface a ray
	 * starts on. Present means the layer draws through the raymarching program and its colors come
	 * off the transfer strip instead of off a color a vertex.
	 */
	volume?: VolumeInput;
	/**
	 * Segments drawn as quads, which turns the cube's layer into rules under the camera.
	 *
	 * Needs `depth`. Present means the layer draws in `color` through the line program, ahead of the
	 * geoms, and writes no depth.
	 */
	lines?: LineInput;
	/** The plot area's domain, so the GPU and the axis agree. */
	xDomain: [number, number];
	yDomain: [number, number];
	/** Where the plot area sits on the page, read fresh each frame by the callback below. */
	rect: () => Rect | null;
	/**
	 * Whether every geom in the layer is opaque.
	 *
	 * Blending is a read-modify-write per fragment, and a layer whose colors all carry full alpha
	 * gains nothing from it. Declared instead of derived, because deriving it means scanning ten
	 * million color bytes on every upload to answer a question the caller already knows.
	 */
	opaque?: boolean;
	/**
	 * Whether the layer answers a hover.
	 *
	 * The picking pass needs an id per geom, which is another four bytes each: forty megabytes at
	 * ten million, uploaded and never read by a chart nobody hovers. Off unless a caller asks.
	 */
	pickable?: boolean;
}

/** What a cube layer adds: a third coordinate a geom, its domain, and where the reader stands. */
export interface DepthInput {
	/** One offset a geom from `center`, as `packDepth` returns them. */
	offsets: Float32Array;
	center: number;
	domain: [number, number];
	orbit: Orbit;
}

/** What a surface adds to a cube layer: a normal a vertex, and the faces over them. */
export interface MeshInput {
	/** Interleaved unit normals in the data's own axes, one a vertex. */
	normals: Float32Array;
	/** Three vertex indices a triangle. */
	indices: Uint32Array;
}

/** What a raymarched kind carries: the field, the strip it reads color from, and how to read it. */
export interface VolumeInput {
	/** One byte a cell, x fastest, as `field3d` packs them. Nought is a cell with no reading. */
	field: Uint8Array;
	dims: [number, number, number];
	/** 256 RGBA bytes: the chart's magnitude map, sampled. */
	ramp: Uint8Array;
	/** Set to stop at the first crossing of `level`; clear to integrate along the ray. */
	iso: boolean;
	/** Where the shell stands, over nought to one. */
	level: number;
	/** How much of the field one step absorbs, for the integrating read. */
	density: number;
	steps: number;
}

/** What a line layer adds: each vertex's far end and corner, and the width. */
export interface LineInput {
	/** The far end of each vertex's segment, as x, y, z offsets from the layer's centers. */
	other: Float32Array;
	/** The side of the segment, minus one or one, then one at the far end. Two floats a vertex. */
	corners: Float32Array;
	/** Line width in CSS pixels. At nought the triangles draw where their vertices stand and fill a pane. */
	width: number;
}

interface Layer extends GlLayerInput {
	id: number;
	buffers: Buffers | null;
	/** Set when the data changed and the buffers have not caught up. */
	dirty: boolean;
}

interface Buffers {
	offsets: WebGLBuffer;
	colors: WebGLBuffer;
	/** Absent on a layer drawing at one diameter. */
	sizes: WebGLBuffer | null;
	/** Absent on a flat layer. */
	depth: WebGLBuffer | null;
	/** Absent on a layer of geoms. */
	normals: WebGLBuffer | null;
	faces: WebGLBuffer | null;
	/** Absent on anything but a line layer. */
	other: WebGLBuffer | null;
	corners: WebGLBuffer | null;
	/** Absent on anything but a raymarched layer. */
	field: WebGLTexture | null;
	ramp: WebGLTexture | null;
	/** Absent on a layer that answers no hover. */
	picks: WebGLBuffer | null;
	count: number;
}

export interface LayerHandle {
	/** Replace what the layer draws. Uploads on the next frame. */
	update(next: Partial<GlLayerInput>): void;
	/** The geom under a point in page coordinates, or null. */
	pick(clientX: number, clientY: number): number | null;
	release(): void;
}

/** Everything the renderer needs from a host, so a test can stand in for the page. */
export interface Host {
	canvas: HTMLCanvasElement;
	/** The canvas rectangle in page coordinates. */
	rect(): Rect;
	dpr(): number;
}

export interface RendererOptions {
	/**
	 * Time each frame.
	 *
	 * A draw call returns once the commands are submitted, so a wall clock around it measures how
	 * fast the CPU can ask. What the budget is about is how long the GPU took, and the two differ by
	 * more than an order of magnitude at ten million geoms. On means the GPU is timed as well, which
	 * costs a query per frame, so it stays off unless asked for.
	 */
	measure?: boolean;
	/**
	 * The host drives frames itself.
	 *
	 * `schedule` draws nothing under this, and `drawNow` is the only thing that puts a frame up. For
	 * a host with a loop of its own to fit this into, and for a harness: a browser that throttles
	 * frames delivers them in bursts, which lands an extra draw between the ones a benchmark asked
	 * for and leaves the distribution bimodal.
	 */
	driven?: boolean;
}

/** How long a set of frames took, in milliseconds. */
export interface Times {
	frames: number;
	p50: number;
	p95: number;
	max: number;
}

/**
 * What the frame budget is read against.
 *
 * `p50`, `p95` and `max` are the submission cost, which is the caller's own stack. `gpu` is what the
 * hardware reported through `EXT_disjoint_timer_query_webgl2`, and that is the number the 8.3ms and
 * 16.7ms targets mean. It is null where the extension is absent or where a disjoint event spoiled
 * the readings, since a made-up number is worse than none.
 */
export interface FrameStats extends Times {
	gpu: Times | null;
	/** Set where the GPU clock was asked for and could not answer. */
	gpuProblem: string | null;
}

/**
 * The GPU clock, which lib.dom does not declare.
 *
 * `TIME_ELAPSED_EXT` is a query the GPU brackets around the frame's commands and answers in
 * nanoseconds once it has run them. `GPU_DISJOINT_EXT` reports that something interrupted the
 * timing, which invalidates every query in flight: a driver reset, a power state change, a context
 * switch away from the page. A disjoint reading gets dropped instead of averaged.
 */
interface TimerQuery {
	TIME_ELAPSED_EXT: number;
	GPU_DISJOINT_EXT: number;
}

/** Draw times kept per renderer, over a window long enough to hold a p95. */
const WINDOW = 240;

const PROGRAM_FAILED = "ts-lib-viz: the GL program failed to build";

/**
 * One turn of the task queue.
 *
 * A timer is the obvious way to wait and it is the wrong one. A page the browser calls hidden
 * clamps `setTimeout` to about a second, so a drain asking for a millisecond between reads spent
 * its whole timeout inside the first wait and a run's last frames stayed out of the numbers. That
 * is the same instrument fault as a throttled frame clock, one layer down. A message channel is not
 * throttled. The timer stays as the fallback for a runtime without one.
 */
const taskTurn = (): Promise<void> =>
	typeof MessageChannel === "function"
		? new Promise((resolve) => {
				const channel = new MessageChannel();
				channel.port1.onmessage = () => resolve();
				channel.port2.postMessage(0);
			})
		: new Promise((resolve) => setTimeout(resolve, 1));

export class SharedRenderer {
	private gl: WebGL2RenderingContext | null = null;
	private program: WebGLProgram | null = null;
	private uniforms: Record<string, WebGLUniformLocation | null> = {};
	/** The cube's program, built beside the flat one and used by the layers that carry a camera. */
	private cubeProgram: WebGLProgram | null = null;
	private cubeUniforms: Record<string, WebGLUniformLocation | null> = {};
	/** The surface's program, which is the cube's with a light and triangles in place of sprites. */
	private meshProgram: WebGLProgram | null = null;
	private meshUniforms: Record<string, WebGLUniformLocation | null> = {};
	/** The raymarching program, which reads a field through the box instead of drawing its surface. */
	private volumeProgram: WebGLProgram | null = null;
	private volumeUniforms: Record<string, WebGLUniformLocation | null> = {};
	/** The line program, for rules drawn under the cube's camera. */
	private lineProgram: WebGLProgram | null = null;
	private lineUniforms: Record<string, WebGLUniformLocation | null> = {};
	/** Vertex attribute slots the context has, read once and used to clear the ones a layer skips. */
	private attribCount = 0;
	private layers = new Map<number, Layer>();
	private nextId = 1;
	private frame: number | null = null;
	private lost = false;
	/** Set once the owner disposed the renderer or the driver refused a program. Nothing is acquired after. */
	private retired = false;
	/** The one-pixel framebuffer a picking pass draws into. Built on the first pick. */
	private picking: {framebuffer: WebGLFramebuffer; color: WebGLRenderbuffer; depth: WebGLRenderbuffer} | null = null;
	private times: number[] = [];
	private gpuTimes: number[] = [];
	private timer: TimerQuery | null | undefined;
	private inFlight: WebGLQuery[] = [];
	private gpuProblem: string | null = null;
	/** Borrowers holding the frame clock. */
	private clockLent = 0;
	/**
	 * The boxes the last frame painted, so this one can clear what it is no longer drawing.
	 *
	 * A frame clears the rectangles its layers own and nothing else, which is what lets a borrower
	 * keep the rest of the canvas. The cost is that a released layer leaves its pixels behind: the
	 * canvas is fixed to the viewport and outlives any chart on it, so a page that swapped one figure
	 * for another would show the first one's geoms under the second's.
	 */
	private painted: Viewport[] = [];
	/** Whether the host drove the clock before any of them asked for it. */
	private readonly ownClock: boolean;

	constructor(
		private host: Host,
		private options: RendererOptions = {},
	) {
		this.ownClock = options.driven === true;
		this.host.canvas.addEventListener("webglcontextlost", this.onLost);
		this.host.canvas.addEventListener("webglcontextrestored", this.onRestored);
	}

	/**
	 * Whether the GPU path is available at all.
	 *
	 * A caller that gets false draws its SVG treatment instead. A page with no WebGL2 is a real
	 * state, and a chart that answers with an empty canvas reads as a broken chart.
	 */
	get available(): boolean {
		return this.acquire() != null;
	}

	/** Layers this renderer is holding, so a borrower can see whether the canvas is already in use. */
	layerCount(): number {
		return this.layers.size;
	}

	/**
	 * Hands the frame clock to whoever borrowed the context, and takes it back on release.
	 *
	 * Two engines on one canvas need one clock or the frame is a race. cosmos clears the whole canvas
	 * every frame it draws, and this renderer clears the rectangles it owns and draws into them, so
	 * the charts survive only where they are drawn after the clear that would have taken them. On its
	 * own clock this renderer draws when something changes, which on a page with an animating graph
	 * means a chart is drawn once and cleared sixteen milliseconds later.
	 *
	 * So the borrower drives: it calls `drawNow` from its own frame callback, and the charts land in
	 * the same frame, after it. Released when the borrower stops drawing, since a clock nobody drives
	 * is a chart that never updates. Counted, so two borrowers cannot hand it back twice.
	 *
	 * See the ADR "The graph surface takes cosmos on the package's own context".
	 */
	lendClock(): () => void {
		this.clockLent += 1;
		this.options = {...this.options, driven: true};
		let given = true;

		return () => {
			if (!given) return;
			given = false;
			this.clockLent -= 1;
			if (this.clockLent > 0) return;
			this.options = {...this.options, driven: this.ownClock};
			this.schedule();
		};
	}

	/**
	 * The context this renderer owns, for a second engine to draw into.
	 *
	 * One shared WebGL2 context is the package's structural advantage, and a page holding charts and
	 * a physics graph would spend two of the eight to sixteen a browser allows if the graph made its
	 * own. Lending is the answer: the borrower attaches to this and does not destroy it, which is the
	 * path both luma and cosmos already support.
	 *
	 * Raw and not wrapped, so nothing in `/react` imports a second GL library. Whoever borrows it
	 * brings its own adapter. See the ADR "The graph surface takes cosmos on the package's own
	 * context".
	 */
	context(): WebGL2RenderingContext | null {
		const gl = this.acquire();
		/* Sized before it is handed over. The canvas is sized inside this renderer's own frame, and a
		   page whose only GL client is the borrower would otherwise lend a canvas at its default 300
		   by 150 stretched over the viewport. */
		if (gl) this.sizeCanvas(gl);
		return gl;
	}

	add(input: GlLayerInput): LayerHandle {
		const id = this.nextId++;
		const layer: Layer = {...input, id, buffers: null, dirty: true};
		this.layers.set(id, layer);
		this.schedule();

		return {
			update: (next) => {
				const held = this.layers.get(id);
				if (!held) return;
				/*
				  A buffer is rebuilt where the array behind it is a different object, and left alone
				  where a caller handed back the one already held.

				  Presence was the test before this, and presence is what a geom component always
				  supplies: it passes its whole input on any change, so rewriting a domain marked the
				  layer dirty and `upload` then freed and rebuilt each buffer with `packIds` re-derived
				  on top of them. At ten million geoms that is the whole allocation paid at each frame
				  of a zoom, which is the cost one shared context and one upload exist to avoid.

				  The arrays and not their wrappers, since `depth`, `mesh` and `volume` each carry
				  camera or transfer settings beside the data: an orbit, a level, a step count. Those
				  reach the GPU as uniforms read fresh each frame, so a rotation or a level dragged
				  across a field re-reads them and uploads nothing. Compared ahead of the assign, which
				  is what would otherwise hide the difference.
				*/
				const differs = (key: "positions" | "colors" | "sizes" | "pickable") => key in next && next[key] !== held[key];
				const rebuilt =
					differs("positions") ||
					differs("colors") ||
					differs("sizes") ||
					differs("pickable") ||
					("depth" in next && next.depth?.offsets !== held.depth?.offsets) ||
					("mesh" in next &&
						(next.mesh?.normals !== held.mesh?.normals || next.mesh?.indices !== held.mesh?.indices)) ||
					("volume" in next &&
						(next.volume?.field !== held.volume?.field || next.volume?.ramp !== held.volume?.ramp)) ||
					("lines" in next && (next.lines?.other !== held.lines?.other || next.lines?.corners !== held.lines?.corners));
				Object.assign(held, next);
				if (rebuilt) held.dirty = true;
				this.schedule();
			},
			pick: (clientX, clientY) => this.pick(id, clientX, clientY),
			release: () => {
				const held = this.layers.get(id);
				if (held?.buffers) this.free(held.buffers);
				this.layers.delete(id);
				this.schedule();
			},
		};
	}

	/** Draws on the next frame. Repeated calls in one frame collapse into one draw. */
	schedule(): void {
		if (this.frame != null || this.lost || this.retired || this.options.driven) return;
		const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;
		if (!raf) {
			// A headless run or a hidden page has no frame clock, so draw straight away.
			this.draw();
			return;
		}
		this.frame = raf(() => {
			this.frame = null;
			this.draw();
		});
	}

	/**
	 * Reads one pixel back, which waits for the GPU to have finished.
	 *
	 * A hard barrier for a harness timing a run of frames. `finish` is documented as waiting for
	 * completion and returns early on the Metal backend, while a read of the framebuffer cannot
	 * answer until the work that fills it has run.
	 */
	readOnePixel(): void {
		const gl = this.acquire();
		if (!gl) return;
		const pixel = new Uint8Array(4);
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
	}

	/**
	 * Draws a frame and reports whether anything landed on the canvas.
	 *
	 * A benchmark over a canvas that drew nothing reads as the fastest renderer ever written, and
	 * that is the shape of a real failure: a hidden page reporting a viewport of nought, a layer
	 * whose rectangle scissored away, a context that never came back after a loss. Sampling the
	 * canvas answers it.
	 *
	 * The draw happens here because the context holds no drawing buffer between tasks: reading a
	 * frame drawn earlier answers empty whether or not that frame worked. `readPixels` stalls the
	 * pipeline, so this is for a harness and not for a frame loop.
	 */
	drewPixels(samples = 64): boolean {
		const gl = this.acquire();
		if (!gl) return false;
		this.drawNow();
		const width = gl.drawingBufferWidth;
		const height = gl.drawingBufferHeight;
		if (width === 0 || height === 0) return false;

		const pixel = new Uint8Array(4);
		const step = Math.max(1, Math.floor(Math.min(width, height) / Math.sqrt(samples)));
		for (let x = 0; x < width; x += step) {
			for (let y = 0; y < height; y += step) {
				gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
				if (pixel[3] !== 0) return true;
			}
		}
		return false;
	}

	/**
	 * Draws now, on the caller's stack.
	 *
	 * `schedule` waits for a frame, and a page the browser calls hidden gets no frames at all, so a
	 * benchmark or an export asking for a frame there would wait forever. This is also what a caller
	 * wants before reading pixels back: the draw has happened by the time it returns.
	 */
	drawNow(): void {
		if (this.frame != null && typeof cancelAnimationFrame === "function") {
			cancelAnimationFrame(this.frame);
		}
		this.frame = null;
		this.draw();
	}

	dispose(): void {
		this.host.canvas.removeEventListener("webglcontextlost", this.onLost);
		this.host.canvas.removeEventListener("webglcontextrestored", this.onRestored);
		if (this.frame != null && typeof cancelAnimationFrame === "function") {
			cancelAnimationFrame(this.frame);
		}
		for (const layer of this.layers.values()) {
			if (layer.buffers) this.free(layer.buffers);
		}
		for (const query of this.inFlight) this.gl?.deleteQuery(query);
		this.inFlight = [];
		this.layers.clear();
		if (this.gl) this.dropPrograms(this.gl);
		if (this.gl && this.picking) {
			this.gl.deleteFramebuffer(this.picking.framebuffer);
			this.gl.deleteRenderbuffer(this.picking.color);
			this.gl.deleteRenderbuffer(this.picking.depth);
		}
		this.picking = null;
		this.gl = null;
		this.timer = undefined;
		this.retired = true;
	}

	/** Deletes the five programs and forgets them. */
	private dropPrograms(gl: WebGL2RenderingContext): void {
		for (const program of [this.program, this.cubeProgram, this.meshProgram, this.volumeProgram, this.lineProgram]) {
			if (program) gl.deleteProgram(program);
		}
		this.program = null;
		this.cubeProgram = null;
		this.meshProgram = null;
		this.volumeProgram = null;
		this.lineProgram = null;
	}

	private onLost = (event: Event) => {
		// Preventing the default is what allows a restore to fire at all.
		event.preventDefault();
		this.lost = true;
		this.gl = null;
		this.program = null;
		this.cubeProgram = null;
		this.meshProgram = null;
		this.volumeProgram = null;
		this.lineProgram = null;
		/* The lost context's objects go with it. A restored context builds its own. */
		this.inFlight = [];
		this.timer = undefined;
		this.picking = null;
		for (const layer of this.layers.values()) {
			layer.buffers = null;
			layer.dirty = true;
		}
	};

	private onRestored = () => {
		this.lost = false;
		this.schedule();
	};

	private acquire(): WebGL2RenderingContext | null {
		if (this.gl || this.lost || this.retired) return this.gl;
		const gl = this.host.canvas.getContext("webgl2", {
			antialias: true,
			/* Each layer's blend writes premultiplied color. A straight-alpha canvas composites it at alpha squared. */
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			// A cube resolves overlap by depth, and a context with no depth buffer has nothing to test.
			depth: true,
		});
		if (!gl) return null;
		try {
			this.build(gl);
		} catch {
			/* A driver that rejects a program leaves the GPU path unavailable. The charts draw their fallback. */
			this.dropPrograms(gl);
			this.retired = true;
			return null;
		}
		this.gl = gl;
		return gl;
	}

	private build(gl: WebGL2RenderingContext): void {
		this.attribCount = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number;
		const program = compile(gl, POINT_VERTEX, POINT_FRAGMENT);
		this.program = program;
		this.uniforms = {
			scale: gl.getUniformLocation(program, "u_scale"),
			translate: gl.getUniformLocation(program, "u_translate"),
			viewport: gl.getUniformLocation(program, "u_viewport"),
			dpr: gl.getUniformLocation(program, "u_dpr"),
			shape: gl.getUniformLocation(program, "u_shape"),
			hollow: gl.getUniformLocation(program, "u_hollow"),
			outline: gl.getUniformLocation(program, "u_outline"),
			flat: gl.getUniformLocation(program, "u_flat"),
			flatColor: gl.getUniformLocation(program, "u_flatColor"),
			picking: gl.getUniformLocation(program, "u_picking"),
			size: gl.getUniformLocation(program, "u_size"),
			flatSize: gl.getUniformLocation(program, "u_flatSize"),
		};

		const cube = compile(gl, CUBE_VERTEX, POINT_FRAGMENT);
		this.cubeProgram = cube;
		this.cubeUniforms = {
			mvp: gl.getUniformLocation(cube, "u_mvp"),
			dpr: gl.getUniformLocation(cube, "u_dpr"),
			depthRef: gl.getUniformLocation(cube, "u_depthRef"),
			shape: gl.getUniformLocation(cube, "u_shape"),
			hollow: gl.getUniformLocation(cube, "u_hollow"),
			outline: gl.getUniformLocation(cube, "u_outline"),
			flat: gl.getUniformLocation(cube, "u_flat"),
			flatColor: gl.getUniformLocation(cube, "u_flatColor"),
			picking: gl.getUniformLocation(cube, "u_picking"),
			size: gl.getUniformLocation(cube, "u_size"),
			flatSize: gl.getUniformLocation(cube, "u_flatSize"),
		};

		const mesh = compile(gl, MESH_VERTEX, MESH_FRAGMENT);
		this.meshProgram = mesh;
		this.meshUniforms = {
			mvp: gl.getUniformLocation(mesh, "u_mvp"),
			normalMatrix: gl.getUniformLocation(mesh, "u_normalMatrix"),
			light: gl.getUniformLocation(mesh, "u_light"),
			ambient: gl.getUniformLocation(mesh, "u_ambient"),
		};

		const volume = compile(gl, VOLUME_VERTEX, VOLUME_FRAGMENT);
		this.volumeProgram = volume;
		this.volumeUniforms = {
			mvp: gl.getUniformLocation(volume, "u_mvp"),
			model: gl.getUniformLocation(volume, "u_model"),
			field: gl.getUniformLocation(volume, "u_field"),
			ramp: gl.getUniformLocation(volume, "u_ramp"),
			eye: gl.getUniformLocation(volume, "u_eye"),
			steps: gl.getUniformLocation(volume, "u_steps"),
			iso: gl.getUniformLocation(volume, "u_iso"),
			level: gl.getUniformLocation(volume, "u_level"),
			density: gl.getUniformLocation(volume, "u_density"),
			light: gl.getUniformLocation(volume, "u_light"),
			ambient: gl.getUniformLocation(volume, "u_ambient"),
		};

		const line = compile(gl, LINE_VERTEX, LINE_FRAGMENT);
		this.lineProgram = line;
		this.lineUniforms = {
			mvp: gl.getUniformLocation(line, "u_mvp"),
			viewport: gl.getUniformLocation(line, "u_viewport"),
			width: gl.getUniformLocation(line, "u_width"),
			color: gl.getUniformLocation(line, "u_color"),
		};
	}

	private free(buffers: Buffers): void {
		const gl = this.gl;
		if (!gl) return;
		gl.deleteBuffer(buffers.offsets);
		gl.deleteBuffer(buffers.colors);
		if (buffers.sizes) gl.deleteBuffer(buffers.sizes);
		if (buffers.depth) gl.deleteBuffer(buffers.depth);
		if (buffers.normals) gl.deleteBuffer(buffers.normals);
		if (buffers.faces) gl.deleteBuffer(buffers.faces);
		if (buffers.other) gl.deleteBuffer(buffers.other);
		if (buffers.corners) gl.deleteBuffer(buffers.corners);
		if (buffers.field) gl.deleteTexture(buffers.field);
		if (buffers.ramp) gl.deleteTexture(buffers.ramp);
		if (buffers.picks) gl.deleteBuffer(buffers.picks);
	}

	private upload(gl: WebGL2RenderingContext, layer: Layer): Buffers | null {
		if (layer.buffers && !layer.dirty) return layer.buffers;
		if (layer.buffers) this.free(layer.buffers);

		const offsets = gl.createBuffer();
		const colors = gl.createBuffer();
		if (!offsets || !colors) return null;

		gl.bindBuffer(gl.ARRAY_BUFFER, offsets);
		gl.bufferData(gl.ARRAY_BUFFER, layer.positions.offsets, gl.STATIC_DRAW);
		if (layer.colors) {
			gl.bindBuffer(gl.ARRAY_BUFFER, colors);
			gl.bufferData(gl.ARRAY_BUFFER, layer.colors, gl.STATIC_DRAW);
		}

		let sizes: WebGLBuffer | null = null;
		if (layer.sizes) {
			sizes = gl.createBuffer();
			if (!sizes) return null;
			gl.bindBuffer(gl.ARRAY_BUFFER, sizes);
			gl.bufferData(gl.ARRAY_BUFFER, layer.sizes, gl.STATIC_DRAW);
		}

		let depth: WebGLBuffer | null = null;
		if (layer.depth) {
			depth = gl.createBuffer();
			if (!depth) return null;
			gl.bindBuffer(gl.ARRAY_BUFFER, depth);
			gl.bufferData(gl.ARRAY_BUFFER, layer.depth.offsets, gl.STATIC_DRAW);
		}

		let normals: WebGLBuffer | null = null;
		let faces: WebGLBuffer | null = null;
		if (layer.mesh) {
			normals = gl.createBuffer();
			faces = gl.createBuffer();
			if (!normals || !faces) return null;
			gl.bindBuffer(gl.ARRAY_BUFFER, normals);
			gl.bufferData(gl.ARRAY_BUFFER, layer.mesh.normals, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faces);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, layer.mesh.indices, gl.STATIC_DRAW);
		}

		let other: WebGLBuffer | null = null;
		let corners: WebGLBuffer | null = null;
		if (layer.lines) {
			other = gl.createBuffer();
			corners = gl.createBuffer();
			if (!other || !corners) return null;
			gl.bindBuffer(gl.ARRAY_BUFFER, other);
			gl.bufferData(gl.ARRAY_BUFFER, layer.lines.other, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, corners);
			gl.bufferData(gl.ARRAY_BUFFER, layer.lines.corners, gl.STATIC_DRAW);
		}

		let field: WebGLTexture | null = null;
		let ramp: WebGLTexture | null = null;
		if (layer.volume) {
			field = uploadField(gl, layer.volume);
			ramp = uploadRamp(gl, layer.volume.ramp);
			if (!field || !ramp) return null;
		}

		let picks: WebGLBuffer | null = null;
		if (layer.pickable) {
			picks = gl.createBuffer();
			if (!picks) return null;
			gl.bindBuffer(gl.ARRAY_BUFFER, picks);
			gl.bufferData(gl.ARRAY_BUFFER, packIds(layer.positions.count), gl.STATIC_DRAW);
		}

		layer.buffers = {
			offsets,
			colors,
			sizes,
			depth,
			normals,
			faces,
			other,
			corners,
			field,
			ramp,
			picks,
			count: layer.positions.count,
		};
		layer.dirty = false;
		return layer.buffers;
	}

	/**
	 * The canvas at the size its host asks for, and the rectangle that size was read from.
	 *
	 * The size is a shared resource the same way the context is. A borrower that resizes the canvas
	 * to suit itself, which is what luma's `autoResize` does, will fight a renderer that resizes it
	 * back every frame: the two write different numbers, the borrower recomputes its own screen from
	 * the change, and the picture warps once a frame. So while the clock is lent the borrower owns the
	 * size and this reads what is there.
	 */
	private sizeCanvas(gl: WebGL2RenderingContext): Rect {
		const rect = this.host.rect();
		if (this.clockLent === 0) {
			const dpr = this.host.dpr();
			const width = Math.max(1, Math.round(rect.width * dpr));
			const height = Math.max(1, Math.round(rect.height * dpr));
			if (this.host.canvas.width !== width) this.host.canvas.width = width;
			if (this.host.canvas.height !== height) this.host.canvas.height = height;
		}
		gl.viewport(0, 0, this.host.canvas.width, this.host.canvas.height);
		return rect;
	}

	/**
	 * Device pixels a CSS pixel, as the drawing buffer actually stands.
	 *
	 * The host states one, and while the canvas belongs to a borrower the buffer may be another size
	 * entirely. Every scissor and viewport is computed against the buffer, so it is read off the
	 * buffer.
	 */
	private dprNow(): number {
		if (this.clockLent === 0) return this.host.dpr();
		const width = this.host.rect().width;
		return width > 0 ? this.host.canvas.width / width : this.host.dpr();
	}

	/**
	 * How long the recent frames took.
	 *
	 * Null before anything has been drawn. The budget in the design doc is 60fps at ten million
	 * client-resident geoms, which is 16.7ms a frame, and this is the number that answers it.
	 */
	stats(): FrameStats | null {
		if (this.times.length === 0) return null;
		const submission = distribution(this.times)!;
		return {
			...submission,
			gpu: distribution(this.gpuTimes),
			gpuProblem: this.gpuTimes.length === 0 ? (this.gpuProblem ?? "no GPU reading arrived") : null,
		};
	}

	resetStats(): void {
		this.times = [];
		this.gpuTimes = [];
		this.gpuProblem = null;
		/* Queries still in flight belong to frames before the reset. Left alone they answer later and
		   land in the next run's numbers, which is how a twenty-frame run reported twenty-eight. */
		for (const query of this.inFlight) this.gl?.deleteQuery(query);
		this.inFlight = [];
	}

	/**
	 * Turns the per-frame finish on or off.
	 *
	 * A benchmark story wants it on for as long as it is reading; a chart in front of somebody wants
	 * it off, since a finish stalls the pipeline. Settable because the surface is shared: whichever
	 * chart mounts first builds the renderer, and a story measuring later cannot re-make it.
	 */
	measure(on: boolean): void {
		this.options = {...this.options, measure: on};
		if (!on) this.resetStats();
	}

	private draw(): void {
		const gl = this.acquire();
		if (!gl || !this.program) return;

		if (this.options.measure) this.collectGpuTimes(gl);
		const query = this.options.measure ? this.beginGpuTime(gl) : null;

		const started = performance.now();
		const canvasRect = this.sizeCanvas(gl);
		gl.clearColor(0, 0, 0, 0);
		/* A depth buffer holding last frame's cube would hide this frame's geoms, and clearing one no
		   layer tests is work the flat path was measured without. */
		const cubed = [...this.layers.values()].some((layer) => layer.depth);
		if (cubed) gl.depthMask(true);
		const mask = cubed ? gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT : gl.COLOR_BUFFER_BIT;

		/*
		  The rectangles this renderer owns, and nothing else. Clearing the whole canvas is what a
		  renderer that owns it does, and this one lends it: a second engine drawing on the same
		  context would be erased by a frame that cleared everything. Deduplicated, since a chart with
		  several layers has one rectangle and the second clear would wipe the first layer's geoms.
		*/
		gl.enable(gl.SCISSOR_TEST);
		const boxes: Viewport[] = [];
		const seen = new Set<string>();
		const keyOf = (box: Viewport) => `${box.x}:${box.y}:${box.width}:${box.height}`;

		for (const layer of this.layers.values()) {
			const chartRect = layer.rect();
			if (!chartRect) continue;
			const clip = scissorFor(chartRect, canvasRect, this.dprNow());
			if (clip.width === 0 || clip.height === 0) continue;
			if (seen.has(keyOf(clip))) continue;
			seen.add(keyOf(clip));
			boxes.push(clip);
		}

		/* Last frame's boxes as well, or a layer that has gone leaves its geoms on the canvas. Cleared
		   once and then forgotten, since a box nothing has drawn into since is already empty. */
		const stale = this.painted.filter((box) => !seen.has(keyOf(box)));

		for (const box of [...boxes, ...stale]) {
			gl.scissor(box.x, box.y, box.width, box.height);
			gl.clear(mask);
		}
		this.painted = boxes;

		/* Panes, then rules, then the geoms. A translucent geom drawn last blends over the chrome behind it. */
		const rank = (layer: Layer) => (!layer.lines ? 2 : layer.lines.width > 0 ? 1 : 0);
		for (const layer of [...this.layers.values()].sort((one, other) => rank(one) - rank(other))) {
			this.drawLayer(gl, layer, canvasRect, false);
		}
		gl.disable(gl.SCISSOR_TEST);

		if (query) this.endGpuTime(gl);
		/* Flushed instead of finished. `finish` is documented as waiting for completion and on the
		   Metal backend it returns while the work is still queued, which is what made a frame at a
		   million geoms read as a tenth of a millisecond. The GPU clock below is the honest answer. */
		if (this.options.measure) gl.flush();
		this.times.push(performance.now() - started);
		if (this.times.length > WINDOW) this.times.shift();
	}

	/** The GPU clock, asked for once and remembered as absent where it is. */
	private gpuClock(gl: WebGL2RenderingContext): TimerQuery | null {
		if (this.timer !== undefined) return this.timer;
		this.timer = gl.getExtension("EXT_disjoint_timer_query_webgl2") as TimerQuery | null;
		if (!this.timer) this.gpuProblem = "EXT_disjoint_timer_query_webgl2 is not available here";
		return this.timer;
	}

	private beginGpuTime(gl: WebGL2RenderingContext): WebGLQuery | null {
		const ext = this.gpuClock(gl);
		if (!ext) return null;
		/* One query at a time. Nesting is an error, and a frame that starts before the last one was
		   read is a frame whose reading nobody wanted. */
		if (this.inFlight.length > 8) return null;
		const query = gl.createQuery();
		if (!query) return null;
		gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
		this.inFlight.push(query);
		return query;
	}

	private endGpuTime(gl: WebGL2RenderingContext): void {
		const ext = this.gpuClock(gl);
		if (ext) gl.endQuery(ext.TIME_ELAPSED_EXT);
	}

	/**
	 * Reads whichever queries the GPU has finished with.
	 *
	 * A query answers a frame or two after the one it timed, so the readings arrive late and the
	 * window fills anyway. A disjoint event throws away everything in flight, since the timings
	 * either side of it are not comparable.
	 */
	private collectGpuTimes(gl: WebGL2RenderingContext): void {
		const ext = this.gpuClock(gl);
		if (!ext || this.inFlight.length === 0) return;

		if (gl.getParameter(ext.GPU_DISJOINT_EXT)) {
			for (const query of this.inFlight) gl.deleteQuery(query);
			this.inFlight = [];
			this.gpuProblem = "a disjoint event dropped the queries in flight";
			return;
		}

		const waiting: WebGLQuery[] = [];
		for (const query of this.inFlight) {
			if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
				waiting.push(query);
				continue;
			}
			const nanoseconds = gl.getQueryParameter(query, gl.QUERY_RESULT) as number;
			gl.deleteQuery(query);
			this.gpuTimes.push(nanoseconds / 1e6);
			if (this.gpuTimes.length > WINDOW) this.gpuTimes.shift();
		}
		this.inFlight = waiting;
	}

	/** Waits for the queries in flight, so a run's last frames are in the numbers. */
	async drainGpuTimes(timeoutMs = 200): Promise<void> {
		const gl = this.acquire();
		if (!gl) return;
		const until = performance.now() + timeoutMs;
		while (this.inFlight.length > 0 && performance.now() < until) {
			this.collectGpuTimes(gl);
			await taskTurn();
		}
	}

	private drawLayer(
		gl: WebGL2RenderingContext,
		layer: Layer,
		canvasRect: Rect,
		picking: boolean,
		shift = {x: 0, y: 0},
	): Viewport | null {
		const cube = layer.depth ?? null;
		/* Neither has geoms to pick: an id buffer addresses vertices and a hover wants a datum. */
		const field = cube && layer.volume && layer.mesh ? layer.volume : null;
		const surface = cube && layer.mesh && !field ? layer.mesh : null;
		const rules = cube && layer.lines ? layer.lines : null;
		if (picking && (surface || field || rules)) return null;
		const program = rules
			? this.lineProgram
			: field
				? this.volumeProgram
				: surface
					? this.meshProgram
					: cube
						? this.cubeProgram
						: this.program;
		if (!program) return null;
		// A picking pass over a layer that uploaded no ids has nothing to read.
		if (picking && !layer.pickable) return null;
		const chartRect = layer.rect();
		if (!chartRect) return null;
		const dpr = this.dprNow();
		/* The viewport carries the whole plot area so the projection is right; the scissor clips it. */
		const box = viewportFor(chartRect, canvasRect, dpr);
		const clip = scissorFor(chartRect, canvasRect, dpr);
		if (clip.width === 0 || clip.height === 0) return null;

		const buffers = this.upload(gl, layer);
		if (!buffers || buffers.count === 0) return box;

		gl.useProgram(program);
		/* A picking pass shifts both by the pointer's pixel, which lands that pixel on the target's origin. */
		gl.viewport(box.x - shift.x, box.y - shift.y, box.width, box.height);
		gl.scissor(clip.x - shift.x, clip.y - shift.y, clip.width, clip.height);
		/* A picking pass writes addresses, and blending two addresses together makes a third one that
		   names the wrong geom, so that pass is opaque whatever the layer says. */
		if (picking || layer.opaque) gl.disable(gl.BLEND);
		else gl.enable(gl.BLEND);
		/* A ray writes premultiplied color and a geom writes straight color. */
		gl.blendFuncSeparate(field ? gl.ONE : gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		if (!surface && !field && !rules) {
			const flat = layer.color ?? [0.5, 0.5, 0.5, 1];
			const shared = cube ? this.cubeUniforms : this.uniforms;
			gl.uniform1f(shared.dpr!, dpr);
			gl.uniform1i(shared.shape!, SHAPE_CODE[layer.shape ?? "circle"]);
			gl.uniform1i(shared.hollow!, layer.hollow ? 1 : 0);
			gl.uniform1f(shared.outline!, POINT_OUTLINE);
			gl.uniform4f(shared.flat!, flat[0], flat[1], flat[2], flat[3]);
			gl.uniform1i(shared.flatColor!, layer.colors ? 0 : 1);
			gl.uniform1i(shared.picking!, picking ? 1 : 0);
			gl.uniform1f(shared.size!, layer.size);
			gl.uniform1i(shared.flatSize!, buffers.sizes ? 0 : 1);
		}

		if (cube) {
			const domains = {x: layer.xDomain, y: layer.yDomain, z: cube.domain};
			const mvp = cubeMatrix(cube.orbit, chartRect.width / (chartRect.height || 1), domains, [
				layer.positions.center[0],
				layer.positions.center[1],
				cube.center,
			]);
			gl.enable(gl.DEPTH_TEST);
			/*
			  Which of depth and blending wins, stated. An opaque cube writes depth, so the nearest
			  geom hides the ones behind it and a hover lands on the one the reader can see. A
			  translucent one tests against what is already there and writes nothing, since the geoms
			  arrive in buffer order and back-to-front sorting at ten million is a sort a frame cannot
			  afford.
			*/
			/*
			  Rules and panes draw first and write no depth. Each geom is inside the box, on or in front
			  of a back wall, and covers them.
			*/
			gl.depthMask(!rules && (picking || layer.opaque === true || surface != null));

			if (field && buffers.field && buffers.ramp) {
				/*
				  The box is the surface a ray starts on, so only its front faces produce fragments.
				  Without the cull each pixel is asked for twice and the far one starts its ray behind
				  the reader.
				*/
				/*
				  The cube's model matrix swaps two axes, so a triangle wound outward arrives clockwise.

				  `cubeModel` sends data y to world z and data z to world y, which is a reflection: its
				  determinant is negative and every face's winding flips with it. Left at the default the
				  box's outward faces read as back faces and the cull below discards all twelve, which drew
				  an empty cube on both field kinds. Stating the winding here keeps the cull meaning what it
				  says, one fragment a pixel at the face where the ray enters.
				*/
				gl.frontFace(gl.CW);
				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.BACK);
				/* A field is read through itself, so its own samples do the occluding. */
				gl.depthMask(false);
				gl.enable(gl.BLEND);

				gl.uniformMatrix4fv(this.volumeUniforms.mvp!, false, mvp);
				gl.uniformMatrix4fv(
					this.volumeUniforms.model!,
					false,
					cubeModel(domains, [layer.positions.center[0], layer.positions.center[1], cube.center]),
				);
				const eye = eyeOf(cube.orbit);
				gl.uniform3f(this.volumeUniforms.eye!, eye[0], eye[1], eye[2]);
				gl.uniform1i(this.volumeUniforms.steps!, field.steps);
				gl.uniform1i(this.volumeUniforms.iso!, field.iso ? 1 : 0);
				gl.uniform1f(this.volumeUniforms.level!, field.level);
				gl.uniform1f(this.volumeUniforms.density!, field.density);
				gl.uniform3f(this.volumeUniforms.light!, CUBE_LIGHT[0], CUBE_LIGHT[1], CUBE_LIGHT[2]);
				gl.uniform1f(this.volumeUniforms.ambient!, AMBIENT);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_3D, buffers.field);
				gl.uniform1i(this.volumeUniforms.field!, 0);
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, buffers.ramp);
				gl.uniform1i(this.volumeUniforms.ramp!, 1);
			} else if (rules) {
				const color = layer.color ?? [0.5, 0.5, 0.5, 1];
				gl.uniformMatrix4fv(this.lineUniforms.mvp!, false, mvp);
				gl.uniform2f(this.lineUniforms.viewport!, box.width, box.height);
				gl.uniform1f(this.lineUniforms.width!, rules.width * dpr);
				gl.uniform4f(this.lineUniforms.color!, color[0], color[1], color[2], color[3]);
			} else if (surface) {
				gl.uniformMatrix4fv(this.meshUniforms.mvp!, false, mvp);
				gl.uniformMatrix3fv(this.meshUniforms.normalMatrix!, false, normalMatrix(domains));
				gl.uniform3f(this.meshUniforms.light!, CUBE_LIGHT[0], CUBE_LIGHT[1], CUBE_LIGHT[2]);
				gl.uniform1f(this.meshUniforms.ambient!, AMBIENT);
			} else {
				gl.uniformMatrix4fv(this.cubeUniforms.mvp!, false, mvp);
				gl.uniform1f(this.cubeUniforms.depthRef!, restingDepth(cube.orbit));
			}
		} else {
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.CULL_FACE);
			const camera = cameraFor(layer.positions.center, layer.xDomain, layer.yDomain, chartRect.width, chartRect.height);
			gl.uniform2f(this.uniforms.scale!, camera.scale[0], camera.scale[1]);
			gl.uniform2f(this.uniforms.translate!, camera.translate[0], camera.translate[1]);
			gl.uniform2f(this.uniforms.viewport!, chartRect.width, chartRect.height);
		}

		/* Attribute slots off ahead of the set this layer binds. One default vertex array serves every
		   layer, and a volume program enables two of the five a cube leaves on. */
		for (let slot = 0; slot < this.attribCount; slot += 1) gl.disableVertexAttribArray(slot);

		bindVertex(gl, program, "a_offset", buffers.offsets, 2, gl.FLOAT, false);
		if (buffers.depth) bindVertex(gl, program, "a_depth", buffers.depth, 1, gl.FLOAT, false);
		if (buffers.normals) bindVertex(gl, program, "a_normal", buffers.normals, 3, gl.FLOAT, false);
		if (buffers.other) bindVertex(gl, program, "a_other", buffers.other, 3, gl.FLOAT, false);
		if (buffers.corners) bindVertex(gl, program, "a_corner", buffers.corners, 2, gl.FLOAT, false);
		/*
		  Both color channels want a value bound whichever pass is running, since an unbound
		  attribute reads as zero and a picking pass reading zero would name the first geom.
		*/
		if (layer.colors) bindVertex(gl, program, "a_color", buffers.colors, 4, gl.UNSIGNED_BYTE, true);
		/* An unbound attribute reads as zero, and a zero diameter draws nothing, so the uniform is
		   what a fixed-diameter layer falls back to. */
		if (buffers.sizes) bindVertex(gl, program, "a_size", buffers.sizes, 1, gl.FLOAT, false);
		if (buffers.picks) {
			bindVertex(gl, program, "a_pick", buffers.picks, 4, gl.UNSIGNED_BYTE, true);
		}

		const triangles = field ? layer.mesh : surface;
		if (triangles && buffers.faces) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.faces);
			gl.drawElements(gl.TRIANGLES, triangles.indices.length, gl.UNSIGNED_INT, 0);
		} else if (rules) {
			gl.drawArrays(gl.TRIANGLES, 0, buffers.count);
		} else {
			gl.drawArrays(gl.POINTS, 0, buffers.count);
		}
		if (field) {
			gl.disable(gl.CULL_FACE);
			gl.frontFace(gl.CCW);
		}
		return box;
	}

	/**
	 * The geom under the pointer, read off a picking pass.
	 *
	 * The pass draws the layer's ids into a cleared, single-sampled pixel of its own. The visible
	 * frame is untouched.
	 */
	private pick(id: number, clientX: number, clientY: number): number | null {
		const gl = this.acquire();
		const layer = this.layers.get(id);
		if (!gl || !layer || !(layer.depth ? this.cubeProgram : this.program)) return null;
		const target = this.pickTarget(gl);
		if (!target) return null;

		const canvasRect = this.sizeCanvas(gl);
		const dpr = this.dprNow();
		const at = {
			x: Math.round((clientX - canvasRect.left) * dpr),
			y: Math.round((canvasRect.height - (clientY - canvasRect.top)) * dpr),
		};

		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.disable(gl.SCISSOR_TEST);
		gl.clearColor(0, 0, 0, 0);
		gl.depthMask(true);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.SCISSOR_TEST);
		const box = this.drawLayer(gl, layer, canvasRect, true, at);
		const pixel = new Uint8Array(4);
		if (box) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
		gl.disable(gl.SCISSOR_TEST);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return box ? colorToId(pixel) : null;
	}

	/** The one-pixel color and depth target a picking pass draws into, built once per context. */
	private pickTarget(gl: WebGL2RenderingContext): WebGLFramebuffer | null {
		if (this.picking) return this.picking.framebuffer;
		const framebuffer = gl.createFramebuffer();
		const color = gl.createRenderbuffer();
		const depth = gl.createRenderbuffer();
		if (!framebuffer || !color || !depth) return null;
		gl.bindRenderbuffer(gl.RENDERBUFFER, color);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, 1, 1);
		gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, color);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this.picking = {framebuffer, color, depth};
		return framebuffer;
	}
}

/** Percentiles over a set of durations, or null where there are none. */
function distribution(times: number[]): Times | null {
	if (times.length === 0) return null;
	const sorted = [...times].sort((a, b) => a - b);
	const at = (q: number) => {
		const pos = (sorted.length - 1) * q;
		const lo = Math.floor(pos);
		return sorted[lo]! + (sorted[Math.ceil(pos)]! - sorted[lo]!) * (pos - lo);
	};
	return {frames: sorted.length, p50: at(0.5), p95: at(0.95), max: sorted[sorted.length - 1]!};
}

/**
 * The scalar field as a 3D texture.
 *
 * One byte a cell and linear filtering, which a byte texture gets without asking the context for
 * anything: a float 3D texture would need `OES_texture_float_linear` to be sampled smoothly, and a
 * field a ray reads in a couple of hundred steps has no use for the levels that would buy. Clamped
 * at the edges so a ray leaving the box reads the last cell instead of wrapping to the far side.
 */
function uploadField(gl: WebGL2RenderingContext, volume: VolumeInput): WebGLTexture | null {
	const texture = gl.createTexture();
	if (!texture) return null;
	const [x, y, z] = volume.dims;

	gl.bindTexture(gl.TEXTURE_3D, texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage3D(gl.TEXTURE_3D, 0, gl.R8, x, y, z, 0, gl.RED, gl.UNSIGNED_BYTE, volume.field);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	return texture;
}

/** The magnitude map as a strip the shader can index by value. */
function uploadRamp(gl: WebGL2RenderingContext, ramp: Uint8Array): WebGLTexture | null {
	const texture = gl.createTexture();
	if (!texture) return null;

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ramp.length / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, ramp);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return texture;
}

/** One value per geom, read straight off the vertex stream. */
function bindVertex(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	buffer: WebGLBuffer,
	size: number,
	type: number,
	normalized: boolean,
): void {
	const location = gl.getAttribLocation(program, name);
	if (location < 0) return;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, type, normalized, 0, 0);
}

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram {
	const program = gl.createProgram();
	const vs = stage(gl, gl.VERTEX_SHADER, vertex);
	const fs = stage(gl, gl.FRAGMENT_SHADER, fragment);
	if (!program || !vs || !fs) throw new Error(PROGRAM_FAILED);

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program);
		throw new Error(`${PROGRAM_FAILED}: ${log ?? "no log"}`);
	}
	return program;
}

function stage(gl: WebGL2RenderingContext, kind: number, source: string): WebGLShader | null {
	const shader = gl.createShader(kind);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`${PROGRAM_FAILED}: ${log ?? "no log"}`);
	}
	return shader;
}
