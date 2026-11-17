# Decisions — PlaneShooter
Các quyết định tự chọn tại chỗ chưa rõ (theo ủy quyền của user), ghi lại để truy vết.

- D-001 (Phase 0+1): `vite.config` dùng `base: './'` thay vì `/PlaneShooter/` — build chạy được cả trên
  GitHub Pages project site, domain riêng và server tĩnh local mà không phải sửa config theo môi trường.
- D-002: Lái bằng chuột theo độ lệch con trỏ so với tâm màn hình (không pointer-lock) — đơn giản, không cần
  click để bắt đầu, phù hợp arcade desktop; pointer-lock để dành khi có tính năng ngắm bắn.
- D-003: Địa hình dùng hàm phân tích `heightAt` (bump mượt theo danh sách đảo trong balance.ts) thay vì
  đọc từ mesh — rẻ, chính xác, dùng chung cho flight/camera; visual đảo dựng khớp cùng tham số.
- D-004: Hướng bay chuẩn là -Z local (chuẩn Three.js camera), euler thứ tự YXZ (yaw → pitch → roll).
- D-005: Boost là state machine ready → active 2.5s → cooldown 5s, kích hoạt theo cạnh lên của phím
  (nhấn mới tính), giữ Shift không tự kích hoạt lại.
- D-006: Không va chạm chết: máy bay và camera đều kẹp mềm theo `heightAt` — đúng yêu cầu "không chết máy" arcade.
- D-007: Deploy GitHub Pages bằng Actions (`deploy-pages`) thay vì nhánh `gh-pages` — cần bật
  Settings → Pages → Source: GitHub Actions trên repo (làm 1 lần, phía user nếu Actions báo lỗi quyền).
- D-008: HUD là DOM trong `index.html` (không vẽ bằng WebGL) — rẻ và dễ đọc; cập nhật qua EventBus.

## Phase 2
- D-009: Sát thương đi đường vòng qua event `combat:damage`; health feature là nơi duy nhất trừ máu —
  súng/tên lửa/AI không bao giờ tự sửa health của nhau.
- D-010: Đạn dùng projectile bay thật + kiểm khoảng cách (không hitscan) để tracer có thời gian bay và né được.
- D-011: Màn kết quả "Chơi lại" = `location.reload()` — đủ cho greybox; state reset đúng vì mọi state nằm trong feature.
- D-012: Căn cứ radar của ném bom = đảo có radius lớn nhất trong balance.world (170,-420) — khớp Art Phase (căn cứ trên đảo lớn).
- D-013: Gamepad RT vừa là ga vừa là cò súng (chuẩn tay cầm game bay arcade thường dùng cò phải cho cả hai);
  chuột vẫn tách rõ: trái = súng, phải = tên lửa.
- D-014: Vitest chốt bản 2.x vì bản mới nhất đòi peer vite ^6+ trong khi dự án dùng vite 5 — nâng cùng lúc khi nâng vite.
- D-015: AI né khi lock progress > 0,35 (chưa cần khóa hoàn toàn) để người chơi cảm nhận được địch phản ứng sớm.
