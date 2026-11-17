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
