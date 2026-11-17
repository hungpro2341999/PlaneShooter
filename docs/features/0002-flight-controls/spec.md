# 0002 — Điều khiển bay arcade — Spec
- Chuột: lái pitch/yaw theo độ lệch khỏi tâm màn hình (có deadzone).
- W/S: tăng/giảm ga. A/D: liệng (roll); liệng tạo cua (bank turn).
- Shift: tăng tốc ×1.6 trong 2.5s, hồi chiêu 5s, có thanh trạng thái trên HUD.
- Tay cầm (Gamepad API, standard mapping): stick trái lái, RT/LT ga, stick phải/LB/RB liệng, nút A boost.
- Tự cân bằng: thả input thì roll/pitch tự về mức bay ngang.
- Không chết máy: tốc độ không xuống dưới minSpeed, độ cao kẹp mềm trên địa hình/dưới trần; không crash.
- Số liệu lấy từ `config/balance.ts` mục `flight`.
