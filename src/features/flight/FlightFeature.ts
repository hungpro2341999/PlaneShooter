import * as THREE from 'three';
import type { GameFeature } from '../../core/GameFeature';
import type { GameServices } from '../../core/GameServices';
import { BoostStateMachine } from './boost';

/**
 * 0002 — Arcade flight control.
 * Mouse steers, W/S throttle, A/D roll, Shift boost (duration + cooldown),
 * gamepad supported, auto-levels when input is released, and can never
 * stall: speed is clamped to [minSpeed, topSpeed] and altitude is softly
 * clamped above the ground and below the ceiling. No crash, no death.
 */
export class FlightFeature implements GameFeature {
  readonly id = '0002-flight';
  private s!: GameServices;
  private targetSpeed = 0;
  private boost!: BoostStateMachine;
  private euler = new THREE.Euler(0, 0, 0, 'YXZ'); // yaw, pitch, roll
  private forward = new THREE.Vector3();
  private statusTimer = 0;

  init(services: GameServices): void {
    this.s = services;
    const f = services.config.flight;
    this.targetSpeed = f.cruiseSpeed;
    this.boost = new BoostStateMachine(f.boost.duration, f.boost.cooldown);
    const plane = services.player.group;
    if (plane) plane.position.set(0, f.startAltitude, 120);
    this.euler.set(0, 0, 0);
  }

  update(dt: number): void {
    const plane = this.s.player.group;
    if (!plane || dt <= 0) return;
    const f = this.s.config.flight;
    const input = this.s.input;

    // --- Boost state machine (pure, unit-tested): ready -> active -> cooldown
    const boosting = this.boost.update(dt, input.boost);

    // --- Speed: throttle moves target, actual chases it, always clamped (no stall)
    this.targetSpeed += input.throttle * f.throttleRate * dt;
    const topSpeed = f.maxSpeed * (boosting ? f.boost.multiplier : 1);
    this.targetSpeed = THREE.MathUtils.clamp(this.targetSpeed, f.minSpeed, topSpeed);
    const speed = THREE.MathUtils.damp(this.s.player.speed || f.cruiseSpeed, this.targetSpeed, f.accelResponse, dt);
    this.s.player.speed = THREE.MathUtils.clamp(speed, f.minSpeed, topSpeed);

    // --- Steering: mouse/stick pitch+yaw; A/D roll; banking adds turn
    const dz = f.mouseDeadzone;
    const sx = Math.abs(input.steerX) < dz ? 0 : input.steerX;
    const sy = Math.abs(input.steerY) < dz ? 0 : input.steerY;
    this.euler.y -= sx * f.yawRate * dt;
    this.euler.x -= sy * f.pitchRate * dt;
    this.euler.x = THREE.MathUtils.clamp(this.euler.x, -f.maxPitch, f.maxPitch);

    const rollInput = input.roll;
    if (rollInput !== 0) this.euler.z -= rollInput * f.rollRate * dt;
    this.euler.y -= Math.sin(this.euler.z) * f.bankTurnRate * dt * -1; // bank into the turn

    // --- Auto-level: with no roll/pitch input, ease back to level flight
    if (rollInput === 0) this.euler.z = THREE.MathUtils.damp(this.euler.z, 0, f.autoLevelRate * 0.45, dt);
    if (sy === 0) this.euler.x = THREE.MathUtils.damp(this.euler.x, 0, f.autoLevelRate * 0.25, dt);
    this.euler.z = THREE.MathUtils.clamp(this.euler.z, -f.maxRoll, f.maxRoll);

    plane.quaternion.setFromEuler(this.euler);

    // --- Move along forward (-Z local), with soft altitude limits
    this.forward.set(0, 0, -1).applyQuaternion(plane.quaternion);
    plane.position.addScaledVector(this.forward, this.s.player.speed * dt);
    const ground = this.s.world.heightAt(plane.position.x, plane.position.z) + f.minAltitudeAboveGround;
    if (plane.position.y < ground) plane.position.y = ground;
    if (plane.position.y > f.ceiling) plane.position.y = f.ceiling;
    // Keep the player inside the greybox sea area (soft wrap of position, heading kept)
    const limit = this.s.config.world.seaSize / 2 - 20;
    plane.position.x = THREE.MathUtils.clamp(plane.position.x, -limit, limit);
    plane.position.z = THREE.MathUtils.clamp(plane.position.z, -limit, limit);

    // Propeller spin scales with speed.
    const prop = plane.getObjectByName('propeller');
    if (prop) prop.rotation.z += dt * (6 + this.s.player.speed * 0.9);

    // --- HUD status at ~10 Hz
    this.statusTimer += dt;
    if (this.statusTimer > 0.1) {
      this.statusTimer = 0;
      this.s.bus.emit('flight:state', {
        speed: this.s.player.speed, boosting,
        boostCharge: this.boost.charge,
      });
    }
  }

  dispose(): void { /* input is owned by Game */ }
}
