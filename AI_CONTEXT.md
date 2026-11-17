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

## Tính năng hiện có (Phase 0+1+2)
- 0001 world greybox: biển + đảo khối + trời đơn giản; sở hữu `world.heightAt(x,z)` (hàm thuần, có test).
- 0002 flight: bay arcade — chuột/W-S/A-D/Shift boost (BoostStateMachine thuần, có test), gamepad, không chết máy.
- 0003 chase camera: bám đuôi có trễ, không xuyên địa hình.
- 0004 súng máy (chuột trái/RT, tracer qua core/Projectiles, quá nhiệt) • 0005 tên lửa (khóa 1,5s trong nón mũi, homing, 6 quả tự nạp).
- 0006 máu/sát thương: AircraftRegistry trong GameServices; sát thương chỉ qua event `combat:damage`;
  chết -> nổ particle + `aircraft:destroyed`.
- 0007 AI địch: tiêm kích tuần tra/đuổi/bắn/né khóa, tránh đảo; ném bom bay tới căn cứ ở đảo lớn nhất, pháo đuôi.
  Model qua `createEnemyModel()` — điểm thay GLB duy nhất (GLB bắt buộc mũi -Z, xem conventions).
- 0008 đợt: 3 đợt (3 / 4+1 / 5+2), 5 phút, thắng-thua + `game:over`. 0009 HUD: FPS, HP, nhiệt, tên lửa, vòng khóa, đợt, đồng hồ, màn kết quả.
- Test: `npm test` (Vitest 2) — EventBus, boost, heightAt; CI chạy test trước build.

## Phân quyền thư mục (QUAN TRỌNG)
- Chat CODE (nhánh `code/*`): chỉ sửa code + docs kỹ thuật trong repo này.
- `public/assets/` và `docs/art/` thuộc chat ASSET — KHÔNG đụng vào.
- Không push thẳng `main`; làm trên nhánh, commit nhỏ, message `feat(<scope>): ...`.

## Tài liệu tiếp theo
- `docs/architecture.md` (kiến trúc), `docs/conventions.md` (quy ước code/commit),
  `docs/decisions.md` (quyết định đã chốt), `docs/features/<ID>-<tên>/` (hồ sơ từng tính năng).
