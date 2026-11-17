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
    maxPitch: 1.1,         // rad — hard pitch limit (A3: lives here, not in code)
    maxRoll: 1.2,          // rad — hard roll limit
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
      { x: 170,  z: -420, radius: 110, height: 20 }, // largest island — radar base sits here
      { x: 260,  z: 60,   radius: 55,  height: 8 },
      { x: -280, z: -380, radius: 75,  height: 12 },
      { x: 60,   z: 180,  radius: 48,  height: 7 },
    ] as ReadonlyArray<{ x: number; z: number; radius: number; height: number }>,
  },
  hud: { fpsRefreshInterval: 0.5 }, // seconds between FPS read-out updates

  // ---- Phase 2: combat ----
  health: {
    player: 100,
    fighter: 40,
    bomber: 140,
    hitRadius: { player: 3.2, fighter: 3.2, bomber: 5 } as Record<string, number>, // m, projectile proximity
  },
  gun: {
    damage: 7,             // per bullet hitting a fighter (40 hp ≈ 6 hits)
    fireInterval: 0.11,    // s between bullets
    projectileSpeed: 260,  // m/s
    projectileLife: 1.6,   // s (max range ≈ 415 m)
    heatPerShot: 0.045,    // heat 0..1
    coolRate: 0.35,        // heat/s while not firing
    coolRateFiring: 0.06,  // heat/s shed even while firing
    overheatResumeAt: 0.35, // after overheating, gun stays locked until heat drops to this
    spread: 0.012,         // rad, random cone
  },
  missile: {
    damage: 70,            // one missile kills a fighter, two kill a bomber
    maxCount: 6,
    regenTime: 4,          // s per missile regenerated (one at a time)
    lockTime: 1.5,         // s target must stay in the reticle cone
    lockAngle: 0.30,       // rad from nose direction that counts as "in reticle"
    lockKeepAngle: 0.45,   // rad — wider cone for keeping an acquired target
    lockRange: 480,        // m
    lockDecayRate: 1.2,    // lock progress lost per second when target leaves the cone
    speed: 95,             // m/s
    turnRate: 2.6,         // rad/s homing steering
    proximity: 7,          // m — detonation distance
    life: 14,              // s before self-destruct
  },
  enemy: {
    fighter: {
      speed: 44, turnRate: 1.15,          // rad/s steering limit
      aggroRange: 340,                     // m — starts chasing the player inside this
      patrolRadius: 150,                   // m — circle radius while patrolling
      fireRange: 240, fireAngle: 0.16,     // rad cone to open fire
      damage: 5, fireInterval: 0.16, projectileSpeed: 230,
      evadeDuration: 1.6,                  // s of jinking when being locked / missile inbound
    },
    bomber: {
      speed: 27, turnRate: 0.55,
      orbitRadius: 120,                    // m — circles the radar base once it arrives
      orbitAltitude: 85,                   // m over the base island
      tailFireRange: 200, tailFireAngle: 0.7, // rad cone behind the bomber
      damage: 4, fireInterval: 0.22, projectileSpeed: 220,
    },
    minAltitudeAboveGround: 6,             // m — AI ground avoidance floor
    spawnDistance: 420,                    // m from map centre area where waves spawn
    spawnAltitude: 90,                     // m
  },
  waves: {
    timeLimit: 300,        // s — whole run (5 minutes)
    betweenWavesDelay: 3,  // s breather between waves
    definitions: [         // Phase 2 spec: fixed wave composition
      { fighters: 3, bombers: 0 },
      { fighters: 4, bombers: 1 },
      { fighters: 5, bombers: 2 },
    ] as ReadonlyArray<{ fighters: number; bombers: number }>,
  },
} as const;

export type Balance = typeof balance;
