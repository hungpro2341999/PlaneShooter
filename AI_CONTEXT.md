# AI_CONTEXT — PlaneShooter (đọc file này trước khi làm bất cứ việc gì)

**Game:** web 3D không chiến arcade, chạy trên trình duyệt desktop.
**Stack:** Three.js + TypeScript + Vite. Không backend, không engine khác.

## Chạy & kiểm chứng
- `npm install` → `npm run dev` (chơi thử) / `npm run build` (bắt buộc pass trước khi commit).
- Deploy: GitHub Actions → GitHub Pages (workflow `.github/workflows/deploy.yml`).

## Kiến trúc trong 30 giây
- `src/core/` — Game (vòng lặp), EventBus (typed pub/sub), Input (phím/chuột/gamepad),
  interface `GameFeature` { id, init, update, dispose }, interface `GameServices`
  (scene, camera, renderer, bus, input, config, world.heightAt, player).
- `src/features/<tên>/` — mỗi tính năng 1 thư mục, 1 class implements GameFeature.
  Tính năng KHÔNG import nhau; chỉ giao tiếp qua GameServices / EventBus (`GameEvents`).
- `src/config/balance.ts` — MỌI số liệu cân bằng ở đây. Cấm hard-code số tuning trong feature.
- Thứ tự update = thứ tự register trong `src/main.ts`: world → flight → camera → hud.
- Quy ước tọa độ: máy bay hướng về -Z local; đơn vị = mét, tốc độ = m/s (HUD hiển thị km/h).

## Tính năng hiện có
- 0001 world greybox: biển + đảo khối + trời màu đơn, máy bay tạm bằng khối hình học,
  sở hữu hàm `world.heightAt(x,z)` (địa hình phân tích, dùng chung cho va chạm/camera).
- 0002 flight: bay arcade — chuột lái, W/S ga, A/D liệng, Shift boost (2.5s, hồi 5s),
  gamepad, tự cân bằng khi thả tay, không bao giờ chết máy (kẹp tốc độ/độ cao mềm).
- 0003 chase camera: bám đuôi có trễ (damping mũ), không xuyên địa hình (kẹp theo heightAt).
- 0004 hud: FPS góc trái, tốc độ + thanh boost góc phải (DOM trong index.html, qua EventBus).

## Phân quyền thư mục (QUAN TRỌNG)
- Chat CODE (nhánh `code/*`): chỉ sửa code + docs kỹ thuật trong repo này.
- `public/assets/` và `docs/art/` thuộc chat ASSET — KHÔNG đụng vào.
- Không push thẳng `main`; làm trên nhánh, commit nhỏ, message `feat(<scope>): ...`.

## Tài liệu tiếp theo
- `docs/architecture.md` (kiến trúc), `docs/conventions.md` (quy ước code/commit),
  `docs/decisions.md` (quyết định đã chốt), `docs/features/<ID>-<tên>/` (hồ sơ từng tính năng).
