/**
 * The point program, and the picking pass that shares its geometry.
 *
 * One vertex per geom, drawn as a point sprite, with the glyph cut out in the fragment stage from
 * `gl_PointCoord`. A quad per geom was the first shape this took and it ran four vertex shader
 * invocations for every geom: at ten million that is forty million, and the measurement said so.
 *
 * Drawing the glyph in the shader keeps the four shapes the SVG path offers, which is the channel
 * that survives a printout and a color-blind reader, and it costs no extra geometry.
 *
 * The picking pass runs the same vertex shader with the id color in place of the fill, so a hit
 * cannot land on a geom the visible pass drew somewhere else.
 */

import type {PointShape} from "../../core/geom-types.js";

/**
 * The outline band a hollow glyph keeps, shared by both point programs.
 *
 * A sprite spans two units across the geom's diameter, so one unit is the radius in device pixels
 * and an outline of `outline` CSS pixels is `2 * outline * dpr / gl_PointSize` of it. Capped at half
 * the glyph so a geom small enough for its own outline to meet in the middle keeps a visible center.
 */
const BAND_FN = `
float band(float outline, float dpr, float sprite) {
  return clamp(2.0 * outline * dpr / max(sprite, 1.0), 0.0, 0.5);
}
`;

export const POINT_VERTEX = `#version 300 es
precision highp float;

/** Offset from the layer's center, in data units. */
in vec2 a_offset;
in vec4 a_color;
in vec4 a_pick;
/** Geom diameter in CSS pixels, where the size channel bound a column. */
in float a_size;

/** Pixels per data unit. */
uniform vec2 u_scale;
/** Where the layer's center sits in the viewport, in pixels. */
uniform vec2 u_translate;
uniform vec2 u_viewport;
/** Geom diameter in CSS pixels, and the ratio that turns it into device pixels. */
uniform float u_size;
uniform float u_dpr;
/** One diameter for the whole layer, where the caller packed no per-geom sizes. */
uniform bool u_flatSize;
/** One color for the whole layer, where the caller supplied no per-geom colors. */
uniform vec4 u_flat;
uniform bool u_flatColor;

/** Outline width of a hollow glyph, in CSS pixels. The fragment stage reads it as v_band. */
uniform float u_outline;

out vec4 v_color;
out vec4 v_pick;
/** Outline width in sprite units, which is what the glyph test can measure against. */
out float v_band;

${BAND_FN}

void main() {
  v_color = u_flatColor ? u_flat : a_color;
  v_pick = a_pick;

  vec2 pixels = a_offset * u_scale + u_translate;
  vec2 clip = (pixels / u_viewport) * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = (u_flatSize ? u_size : a_size) * u_dpr;
  v_band = band(u_outline, u_dpr, gl_PointSize);
}
`;

/**
 * The glyph, cut from the sprite.
 *
 * `u_shape` names one of the four the point geom offers, in the same order the spec's `PointShape`
 * lists them: circle, square, triangle, diamond. A fragment outside the glyph is discarded, which
 * is what keeps a triangle from reading as a box at four pixels.
 *
 * Each glyph is a signed distance in sprite units and not a boolean, since `u_hollow` needs to know
 * how deep inside the edge a fragment sits. The four boundaries are where they were: a hollow glyph
 * is the filled one with its middle taken out, so switching one series to outlines leaves both
 * series covering the same footprint.
 *
 * Picking reads the filled footprint whatever `u_hollow` says. A pointer aimed at the center of a
 * ring is aimed at that geom, and a hit that fell through the hole would land on whatever sits
 * behind it.
 */
export const POINT_FRAGMENT = `#version 300 es
precision highp float;

in vec4 v_color;
in vec4 v_pick;
in float v_band;

uniform int u_shape;
/** Draws the glyph as an outline v_band deep, with the page showing through the middle. */
uniform bool u_hollow;
/** Picking writes the address instead of the fill. */
uniform bool u_picking;

out vec4 fragColor;

void main() {
  // Sprite coordinates run 0 to 1 with y down; the glyphs want -1 to 1 with y up.
  vec2 p = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y) * 2.0 - 1.0;
  float d;

  if (u_shape == 1) {
    d = max(abs(p.x), abs(p.y)) - 1.0;
  } else if (u_shape == 2) {
    /* Triangle: two half-planes from the apex at (0, 1) to the base corners, and the base itself.
       Divided by the edge normal's length so the result is a distance and not a half-plane test,
       which is what makes the outline the same width down all three sides. */
    d = max((2.0 * abs(p.x) + p.y - 1.0) * 0.4472136, -1.0 - p.y);
  } else if (u_shape == 3) {
    d = (abs(p.x) + abs(p.y) - 1.0) * 0.7071068;
  } else {
    d = length(p) - 1.0;
  }

  if (d > 0.0) discard;
  if (u_hollow && !u_picking && d < -v_band) discard;
  fragColor = u_picking ? v_pick : v_color;
}
`;

/**
 * The cube's vertex program, which is the point program under a camera.
 *
 * The 2D path maps offsets to pixels with two uniforms and writes a flat z. A cube needs the whole
 * model-view-projection product, so it takes a matrix and leaves the other path alone: the frame
 * numbers measured against the flat program stand as they were measured.
 *
 * The third coordinate arrives as its own attribute beside the interleaved pair, so a caller packs
 * x and y the way it already does and adds one float a geom for depth.
 *
 * Geoms scale with distance, which is the first of the two depth cues the design language asks for.
 * The projection divides by view depth and the sprite is divided by the same number, so a geom that
 * moves away shrinks the way the geometry around it does. See the ADR "A third position scale is
 * permitted where the reader can rotate".
 */
export const CUBE_VERTEX = `#version 300 es
precision highp float;

/** Offset from the layer's center on the floor plane, in data units. */
in vec2 a_offset;
/** Offset from the layer's center on the third scale, in data units. */
in float a_depth;
in vec4 a_color;
in vec4 a_pick;
in float a_size;

/** Model, view and projection, multiplied on the CPU where it changes once a frame. */
uniform mat4 u_mvp;
/** Geom diameter in CSS pixels, and the ratio that turns it into device pixels. */
uniform float u_size;
uniform float u_dpr;
uniform bool u_flatSize;
/** View depth at which a geom draws its stated diameter. Geoms either side of it scale around it. */
uniform float u_depthRef;
uniform vec4 u_flat;
uniform bool u_flatColor;

/** Outline width of a hollow glyph, in CSS pixels. */
uniform float u_outline;

out vec4 v_color;
out vec4 v_pick;
out float v_band;

${BAND_FN}

void main() {
  v_color = u_flatColor ? u_flat : a_color;
  v_pick = a_pick;

  gl_Position = u_mvp * vec4(a_offset, a_depth, 1.0);

  float diameter = u_flatSize ? u_size : a_size;
  // A geom behind the eye has no size worth computing, and a divide by nought writes a NaN.
  float depth = max(gl_Position.w, 0.001);
  gl_PointSize = max(1.0, diameter * u_dpr * u_depthRef / depth);
  /* A geom that moved away shrinks, and its outline shrinks with it, so a receding hollow cloud
     stays hollow instead of closing into dots. */
  v_band = band(u_outline, u_dpr, gl_PointSize);
}
`;

/**
 * The mesh program: triangles with a light on them.
 *
 * A relief and a structure read as objects or they read as nothing, and what makes a projected
 * object an object is shading. The light is fixed in the world instead of to the camera, so a
 * reader turning the figure watches the light cross it, which says as much about the shape as the
 * parallax does.
 *
 * Positions arrive the way a cube's points do, as offsets on the pair plus one on the third scale,
 * so one camera serves both programs. The normals come off the CPU, averaged over the faces each
 * vertex belongs to.
 */
export const MESH_VERTEX = `#version 300 es
precision highp float;

in vec2 a_offset;
in float a_depth;
in vec3 a_normal;
in vec4 a_color;

uniform mat4 u_mvp;
/** Turns a normal in the data's axes into one in the world, past the model's own scaling. */
uniform mat3 u_normalMatrix;

out vec4 v_color;
out vec3 v_normal;

void main() {
  v_color = a_color;
  v_normal = normalize(u_normalMatrix * a_normal);
  gl_Position = u_mvp * vec4(a_offset, a_depth, 1.0);
}
`;

export const MESH_FRAGMENT = `#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_normal;

uniform vec3 u_light;
uniform float u_ambient;

out vec4 fragColor;

void main() {
  // Absolute, so a relief seen from beneath is lit instead of black: both faces are the same surface.
  float lambert = abs(dot(normalize(v_normal), normalize(u_light)));
  fragColor = vec4(v_color.rgb * (u_ambient + (1.0 - u_ambient) * lambert), v_color.a);
}
`;

/**
 * The line program. It draws segments under the cube's camera as quads a set number of pixels wide.
 *
 * Each segment is six vertices with its far end and a corner code. The vertex stage widens it on screen.
 * At nought width the triangles draw in place, as a pane.
 */
export const LINE_VERTEX = `#version 300 es
precision highp float;

in vec2 a_offset;
in float a_depth;
/** The segment's other end, as offsets from the layer's center. */
in vec3 a_other;
/** Which side of the segment the vertex stands, minus one or one, and whether it is the far end. */
in vec2 a_corner;

uniform mat4 u_mvp;
/** The plot area in device pixels. */
uniform vec2 u_viewport;
/** Line width in device pixels. */
uniform float u_width;

void main() {
  vec4 self = u_mvp * vec4(a_offset, a_depth, 1.0);
  vec4 other = u_mvp * vec4(a_other, 1.0);
  float w = max(self.w, 0.001);
  vec2 half_viewport = 0.5 * u_viewport;
  vec2 here = self.xy / w * half_viewport;
  vec2 there = other.xy / max(other.w, 0.001) * half_viewport;

  vec2 run = a_corner.y > 0.5 ? here - there : there - here;
  float span = length(run);
  vec2 dir = span > 0.0 ? run / span : vec2(1.0, 0.0);
  vec2 shift = vec2(-dir.y, dir.x) * a_corner.x * 0.5 * u_width;

  gl_Position = vec4(self.xy + shift / half_viewport * w, self.z, self.w);
}
`;

export const LINE_FRAGMENT = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 fragColor;

void main() {
  fragColor = u_color;
}
`;

/**
 * The raymarched program, for the two kinds that read a field through its depth.
 *
 * The geometry is the box itself: the front faces are drawn, each fragment is where a ray enters,
 * and the ray walks to where it leaves. `isosurface` stops at the first crossing of the level and
 * shades it with the gradient, which is the normal of the shell it just hit. `volume` keeps walking
 * and composites front to back, which is what makes a field readable through itself.
 *
 * The field is a byte a cell in a 3D texture, and the transfer function is a 256-wide strip of the
 * chart's own magnitude map. Byte nought is the cell nothing landed in and it stays clear, so a
 * sparse field reads as sparse instead of as a block of the low color.
 *
 * See the ADR "A third position scale is permitted where the reader can rotate".
 */
export const VOLUME_VERTEX = `#version 300 es
precision highp float;

in vec2 a_offset;
in float a_depth;

uniform mat4 u_mvp;
/** The model alone, so the fragment stage has the ray's start in the unit box. */
uniform mat4 u_model;

out vec3 v_entry;

void main() {
  vec4 world = u_model * vec4(a_offset, a_depth, 1.0);
  v_entry = world.xyz;
  gl_Position = u_mvp * vec4(a_offset, a_depth, 1.0);
}
`;

export const VOLUME_FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler3D;

in vec3 v_entry;

uniform sampler3D u_field;
/** The magnitude map as a strip, so the ray reads the chart's own colors. */
uniform sampler2D u_ramp;
/** Where the reader is standing, in the unit box. */
uniform vec3 u_eye;
/** Steps a ray takes across the box. */
uniform int u_steps;
/** Set for an isosurface, clear for a volume. */
uniform bool u_iso;
/** The level an isosurface stands at, over nought to one. */
uniform float u_level;
/** How much of the field one step of a volume ray absorbs. */
uniform float u_density;
uniform vec3 u_light;
uniform float u_ambient;

out vec4 fragColor;

/** Where a ray leaves the box, as a distance along it. */
float exitAt(vec3 from, vec3 dir) {
  vec3 far = (sign(dir) - from) / max(abs(dir), vec3(1e-6)) * sign(dir);
  return min(min(far.x, far.y), far.z);
}

/*
  The world draws the third scale upward, so world y is the data's z and world z is the data's y.
  The field is packed in the data's own axis order, and the lookup is where the swap is undone.
*/
float sampleAt(vec3 p) {
  return texture(u_field, vec3(p.x, p.z, p.y) * 0.5 + 0.5).r;
}

/** The field's gradient, by central differences, which is the shell's own normal. */
vec3 gradientAt(vec3 p, float step) {
  vec2 d = vec2(step, 0.0);
  return normalize(vec3(
    sampleAt(p + d.xyy) - sampleAt(p - d.xyy),
    sampleAt(p + d.yxy) - sampleAt(p - d.yxy),
    sampleAt(p + d.yyx) - sampleAt(p - d.yyx)
  ) + vec3(1e-6));
}

void main() {
  vec3 dir = normalize(v_entry - u_eye);
  float span = exitAt(v_entry, dir);
  float stride = span / float(u_steps);

  vec3 p = v_entry;
  vec4 out_color = vec4(0.0);

  for (int step = 0; step < 512; step += 1) {
    if (step >= u_steps) break;

    float value = sampleAt(p);
    if (value > 0.0) {
      if (u_iso) {
        if (value >= u_level) {
          vec3 normal = gradientAt(p, stride);
          float lambert = abs(dot(normal, normalize(u_light)));
          vec3 tint = texture(u_ramp, vec2(value, 0.5)).rgb;
          fragColor = vec4(tint * (u_ambient + (1.0 - u_ambient) * lambert), 1.0);
          return;
        }
      } else {
        vec4 sampled = texture(u_ramp, vec2(value, 0.5));
        float alpha = value * u_density;
        // Front to back: what is already written blocks what is behind it.
        out_color.rgb += (1.0 - out_color.a) * sampled.rgb * alpha;
        out_color.a += (1.0 - out_color.a) * alpha;
        if (out_color.a > 0.98) break;
      }
    }

    p += dir * stride;
  }

  if (u_iso && out_color.a == 0.0) discard;
  if (out_color.a <= 0.001) discard;
  fragColor = out_color;
}
`;

/** Shape codes, in the order the spec's `PointShape` union lists them. */
export const SHAPE_CODE = {circle: 0, square: 1, triangle: 2, diamond: 3} as const satisfies Record<PointShape, number>;
