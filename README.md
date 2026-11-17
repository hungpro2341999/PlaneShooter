# PlaneShooter

## 🎮 Chơi ngay
**https://hungpro2341999.github.io/PlaneShooter/** — mở bằng trình duyệt desktop (Chrome/Edge), không cần cài gì.

## Điều khiển
| Thao tác | Bàn phím / chuột | Tay cầm (Gamepad) |
|---|---|---|
| Lái (pitch/yaw) | Di chuột (lệch khỏi tâm = rẽ) | Stick trái |
| Tăng / giảm ga | W / S | RT / LT |
| Liệng (roll) | A / D | Stick phải hoặc LB / RB |
| Tăng tốc (boost) | Shift (giữ ngắn 2,5s, hồi 5s) | Nút A |
| Súng máy | Chuột trái (giữ lâu sẽ quá nhiệt) | RT |
| Tên lửa | Chuột phải — cần khóa mục tiêu trước | LB |
| Khóa mục tiêu | Giữ địch trong vòng ngắm giữa màn hình ~1,5 giây tới khi vòng chuyển đỏ "ĐÃ KHÓA" | (như chuột) |

## Mục tiêu trận
- 3 đợt địch: đợt 1 = 3 tiêm kích; đợt 2 = 4 tiêm kích + 1 máy bay ném bom; đợt 3 = 5 tiêm kích + 2 ném bom.
- Giới hạn 5 phút. **Thắng:** hạ hết cả 3 đợt. **Thua:** máy bay của bạn bị hạ hoặc hết giờ.
- Tên lửa: 6 quả, tự nạp lại theo thời gian. Địch bị khóa sẽ né — hãy dí theo. Máy bay ném bom bay tới căn cứ radar trên đảo lớn và có pháo đuôi bắn trả.

## Chạy local (cho dev)
```bash
npm install
npm run dev      # chơi thử
npm test         # unit test (Vitest)
npm run build    # build production vào dist/
```

---
Game web 3D không chiến — Three.js + TypeScript + Vite.
Đọc trước khi code: [AI_CONTEXT.md](AI_CONTEXT.md) • [docs/architecture.md](docs/architecture.md) • [docs/conventions.md](docs/conventions.md) • Tài sản & giấy phép: [docs/assets.md](docs/assets.md)
