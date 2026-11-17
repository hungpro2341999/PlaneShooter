/**
 * ALL gameplay balance numbers live here. Never hard-code tuning values
 * inside feature code — import from this file (see docs/conventions.md).
 */
export const balance = {
  flight: {
    minSpeed: 18,          // m/s — floor speed; the plane can never stall (arcade rule)
    cruiseSpeed: 38,       // m/s — starting / neutral-throttle speed
    maxSpeed: 65,          // m/s — top speed without boost
    throttleRate: 22,      // m/s^2 change while W/S held
    accelResponse: 1.6,    // how fast actual speed chases target speed (1/s)
    pitchRate: 1.35,       // rad/s at full mouse-Y deflection
    yawRate: 0.85,         // rad/s at full mouse-X deflection
    rollRate: 2.4,         // rad/s while A/D held
    bankTurnRate: 0.9,     // extra yaw (rad/s) at full bank — banking turns the plane
    autoLevelRate: 3.2,    // how fast roll/pitch ease back to level when input released
    mouseDeadzone: 0.04,   // normalized offset from screen centre ignored
    boost: {
      multiplier: 1.6,     // top-speed multiplier while boosting
      duration: 2.5,       // seconds of boost per activation
      cooldown: 5,         // seconds before boost can be used again
    },
    minAltitudeAboveGround: 2.5, // m — soft floor above terrain/sea, never crash into ground
    ceiling: 220,                // m — soft ceiling
    startAltitude: 60,           // m
  },
  camera: {
    distance: 11,          // m behind the plane
    height: 3.4,           // m above the plane
    followDamping: 4.2,    // position smoothing (higher = tighter)
    lookDamping: 6,        // look-at smoothing
    lookAhead: 14,         // m in front of the plane the camera aims at
    minHeightAboveGround: 1.6, // m — camera never goes under terrain/sea
    fov: 62,
  },
  world: {
    seaSize: 2400,         // m, square sea plane
    fogNear: 120,
    fogFar: 1100,
    // Greybox islands: analytic height field shared by visuals + collision + camera.
    islands: [
      { x: 0,    z: -260, radius: 90,  height: 14 },
      { x: -190, z: -90,  radius: 60,  height: 9 },
      { x: 170,  z: -420, radius: 110, height: 20 },
      { x: 260,  z: 60,   radius: 55,  height: 8 },
      { x: -280, z: -380, radius: 75,  height: 12 },
      { x: 60,   z: 180,  radius: 48,  height: 7 },
    ] as ReadonlyArray<{ x: number; z: number; radius: number; height: number }>,
  },
  hud: { fpsRefreshInterval: 0.5 }, // seconds between FPS read-out updates
} as const;

export type Balance = typeof balance;
