# 0002 — Design
- State: euler YXZ (yaw/pitch/roll), targetSpeed và speed thực (damp về target), boost state machine (D-005).
- Input qua `services.input` (trục steerX/steerY, throttle, roll, boost) — feature không đọc DOM trực tiếp.
- Di chuyển: forward = (0,0,-1) xoay theo quaternion; vị trí += forward × speed × dt.
- Kẹp mềm: y >= heightAt + minAltitudeAboveGround; y <= ceiling; x/z trong vùng biển.
- Phát event `flight:state` 10Hz cho HUD (tốc độ, boosting, boostCharge 0..1).
