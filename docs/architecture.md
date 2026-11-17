# Architecture — PlaneShooter

## Tổng quan
Single-page web game. Vite bundle `src/main.ts` → `Game` tạo renderer/scene/camera,
đăng ký các feature theo thứ tự, chạy vòng lặp `requestAnimationFrame` với `dt` kẹp tối đa 0.05s.

## Lớp core (`src/core/`)
| File | Vai trò |
|---|---|
| `Game.ts` | Vòng lặp chính, resize, đếm FPS và phát event `game:fps`, quản lý vòng đời feature |
| `GameFeature.ts` | Interface mọi tính năng phải theo: `id`, `init(services)`, `update(dt)`, `dispose()` |
| `GameServices.ts` | Interface dịch vụ dùng chung: scene, camera, renderer, bus, input, config, world, player |
| `EventBus.ts` | Pub/sub có kiểu; mọi event liên-feature khai báo trong `GameEvents` |
| `Input.ts` | Gộp bàn phím + chuột + Gamepad API thành trục/nút thống nhất |

## Lớp feature (`src/features/`)
Mỗi feature tự chứa state của mình, chỉ phụ thuộc `GameServices`.
Thứ tự update hiện tại: `world` (tĩnh) → `flight` (di chuyển máy bay) → `camera` (bám theo) → `hud` (event-driven).

## Dữ liệu dùng chung
- `GameServices.player`: `{ group: THREE.Group, speed: number }` — world tạo group, flight ghi vị trí/tốc độ, camera đọc.
- `GameServices.world.heightAt(x,z)`: world đăng ký hàm chiều cao địa hình phân tích (biển = 0, đảo = bump mượt).
  Flight dùng để kẹp độ cao tối thiểu, camera dùng để chống xuyên địa hình. Không feature nào tự đoán địa hình.
- `src/config/balance.ts`: nguồn duy nhất của số liệu cân bằng (tốc độ, lực lái, boost, camera, đảo…).

## Luồng 1 frame
Input (đọc trực tiếp trạng thái phím/chuột/gamepad) → Flight cập nhật euler/tốc độ/vị trí →
Camera tính vị trí mong muốn + damping + kẹp địa hình → HUD nhận event (FPS 2Hz, flight state 10Hz) → render.

## Mở rộng sau này
Thêm tính năng = thêm thư mục `src/features/<tên>/` + 1 dòng register trong `main.ts` + hồ sơ `docs/features/<ID>-<tên>/`.
Vũ khí/địch/âm thanh dự kiến đều đi theo đường này; asset thật do chat ASSET cung cấp qua `public/assets/`.
