# Conventions — PlaneShooter

## Code
- TypeScript `strict`, không dùng `any` bừa bãi; kiểu event khai báo trong `GameEvents`.
- Mỗi tính năng = 1 thư mục `src/features/<tên>/`, 1 class `implements GameFeature`, `id` khớp hồ sơ docs (vd `0002-flight`).
- Cấm hard-code số tuning: mọi hằng số gameplay vào `src/config/balance.ts`.
- Feature không import feature khác; giao tiếp qua `GameServices` / `EventBus`.
- Mọi thứ feature tạo ra (mesh, listener, subscription) phải dọn trong `dispose()`.
- Đặt tên: file PascalCase cho class (vd `FlightFeature.ts`), thư mục feature kebab-case.
- Đơn vị: mét, giây, radian; tốc độ nội bộ m/s. Hướng bay chuẩn: -Z local.

## Tài liệu
- Tính năng mới phải có `docs/features/<ID>-<tên>/` gồm `spec.md`, `design.md`, `tasks.md` trước khi code.
- Quyết định kỹ thuật phát sinh giữa chừng ghi vào `docs/decisions.md` (không hỏi lại user khi đã được ủy quyền tự chọn).
- `AI_CONTEXT.md` giữ tối đa 1 trang; chỉ sửa khi kiến trúc/phân quyền thay đổi.

## Git
- Không push thẳng `main`. Nhánh theo việc: `code/phase-<n>`, `feat/<tên>`…
- Commit nhỏ, 1 việc 1 commit, message Conventional Commits: `feat(flight): ...`, `fix(camera): ...`, `docs: ...`, `ci: ...`, `chore(core): ...`.
- Trước khi push: `npm run build` phải pass; nếu có thay đổi hình ảnh, kèm screenshot trong `docs/screenshots/`.

## Asset & model (phối hợp chat ASSET)
- Mọi model GLB phải hướng mũi về **-Z** (chuẩn hướng bay của code), origin tại tâm máy bay.
  Khi nạp model ngoài mà mũi khác hướng, bọc trong Group và xoay Group Y 180° — không sửa logic bay.
- Điểm thay model duy nhất phía code: `createEnemyModel()` (địch) và world feature (player);
  dữ liệu chiến đấu nằm trong AircraftEntity, không nằm trong model.

## Ranh giới
- Không sửa `public/assets/`, `docs/art/` (chat ASSET phụ trách).
- Không thêm dependency mới nếu Three.js/vanilla làm được; cần thêm thì ghi lý do vào `docs/decisions.md`.
