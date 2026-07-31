// =============================================================================
// Geometry for the procedural 3D superbike in the home hero.
//
// Plain data, no imports: useSuperbikeScene builds three.js meshes from it, and
// scripts/render-bike-profile.mjs reads this same file to draw the side view as
// an SVG. That means the silhouette can be checked without a browser, and the
// numbers can never drift between the checker and the scene.
//
// UNITS ARE METRES, with y = 0 at the ground and +x towards the front wheel.
// Reference dimensions of a litre-class sportbike, used to keep proportions
// honest: wheelbase 1.44 m, wheel outside diameter 0.62 m, seat height 0.83 m,
// screen top around 1.05 m, overall length about 2.07 m.
//
// `profile` entries are side-view outlines extruded across the bike's width;
// this is what gives the model a readable silhouette instead of stacked boxes.
// =============================================================================

export const bikeModel = {
  /** Wheels: `tyre` is the torus centre-line radius, `tube` its section. */
  wheels: {
    tyre: 0.245,
    tube: 0.065,
    /** Ground clearance follows from tyre + tube, so nothing sinks into the floor. */
    rearX: -0.72,
    frontX: 0.72,
  },

  // Extruded side profiles. `depth` is the width across the bike. Outlines are
  // wound consistently and kept simple (no self-intersections) so ExtrudeGeometry
  // triangulates them cleanly. Landmarks they are built around: rear axle
  // (-0.72, 0.31), front axle (0.72, 0.31), seat top 0.86, tank top 0.95,
  // steering head (0.44, 0.98), screen top 1.08, nose 0.90.
  profiles: {
    // Front cowl wrapping the steering head, falling away to the belly.
    fairing: {
      depth: 0.32,
      bevel: 0.03,
      points: [
        [0.36, 0.72],
        [0.48, 0.88],
        [0.7, 0.86],
        [0.86, 0.74],
        [0.88, 0.6],
        [0.78, 0.46],
        [0.6, 0.44],
        [0.44, 0.58],
      ],
    },
    // Tank rising forward from the seat towards the steering head.
    tank: {
      depth: 0.36,
      bevel: 0.045,
      points: [
        [-0.12, 0.78],
        [-0.06, 0.88],
        [0.12, 0.95],
        [0.34, 0.94],
        [0.44, 0.85],
        [0.38, 0.73],
        [0.04, 0.7],
      ],
    },
    // Slim tapered tail, ending just behind the rear wheel.
    tail: {
      depth: 0.19,
      bevel: 0.025,
      points: [
        [-0.24, 0.8],
        [-0.32, 0.88],
        [-0.6, 0.86],
        [-0.88, 0.75],
        [-0.8, 0.7],
        [-0.54, 0.73],
        [-0.28, 0.74],
      ],
    },
    // Belly pan closing the underside of the engine.
    bellypan: {
      depth: 0.28,
      bevel: 0.02,
      points: [
        [0.0, 0.46],
        [0.42, 0.36],
        [0.64, 0.44],
        [0.56, 0.51],
        [0.22, 0.5],
      ],
    },
    // Mudguard hugging the top arc of the front tyre.
    mudguard: {
      depth: 0.17,
      bevel: 0.02,
      points: [
        [0.52, 0.57],
        [0.62, 0.67],
        [0.82, 0.65],
        [0.94, 0.54],
        [0.88, 0.5],
        [0.79, 0.59],
        [0.63, 0.61],
        [0.57, 0.53],
      ],
    },
    screen: {
      depth: 0.24,
      bevel: 0.012,
      points: [
        [0.46, 0.96],
        [0.6, 1.08],
        [0.76, 0.92],
        [0.56, 0.88],
      ],
    },
  },

  /** Box/cylinder parts: `at` is the centre, `size` is [x, y, z] or [r, length]. */
  parts: {
    engineBlock: { at: [0.16, 0.56], size: [0.4, 0.32, 0.32] },
    cylinderHead: { at: [0.3, 0.75], size: [0.26, 0.14, 0.3], rotate: -0.24 },
    sump: { at: [0.14, 0.4], size: [0.3, 0.09, 0.26] },
    seat: { at: [-0.28, 0.845], size: [0.26, 0.05, 0.24], rotate: 0.03 },
    /** Two rails per side, mirrored across z by `offsets`. */
    railUpper: { at: [0.06, 0.74], size: [0.5, 0.05, 0.05], rotate: -0.12 },
    railLower: { at: [-0.16, 0.56], size: [0.42, 0.045, 0.045], rotate: 0.3 },
    swingarm: { at: [-0.4, 0.36], size: [0.66, 0.06, 0.055], rotate: 0.09 },
    /** Fork tube: [radius, length]; rotate tilts the top rearwards (rake). */
    fork: { at: [0.58, 0.645], size: [0.036, 0.73], rotate: 0.4 },
    handlebar: { at: [0.46, 0.94], size: [0.022, 0.52] },
    exhaustHeader: { at: [0.12, 0.38], size: [0.03, 0.5], rotate: 1.5 },
    silencer: { at: [-0.46, 0.42], size: [0.058, 0.3], rotate: 1.35 },
    headlight: { at: [0.88, 0.7], size: [0.075] },
    taillight: { at: [-0.9, 0.8], size: [0.05, 0.05, 0.15] },
  },

  /** Mirrored z offsets for paired parts (forks, rails, swingarm). */
  offsets: {
    rails: [-0.14, 0.14],
    forks: [-0.12, 0.12],
    swingarm: [-0.12, 0.12],
  },

  /** Camera framing for the turntable. */
  camera: {
    fov: 36,
    position: [2.85, 1.55, 3.4],
    target: [0, 0.72, 0],
  },
} as const

export type BikeModel = typeof bikeModel
