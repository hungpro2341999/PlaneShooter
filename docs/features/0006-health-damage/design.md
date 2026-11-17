# 0006 — Design
- Health feature là nơi DUY NHẤT thay đổi máu: mọi nguồn sát thương gửi `combat:damage {targetId, amount}`.
- Đăng ký entity player vào AircraftRegistry lúc init; địch do AI (0007) đăng ký khi spawn.
- Nổ: THREE.Points 90 hạt cam, drift + fade 1,1s — hiệu ứng tạm, chờ sprite VFX của ASSET phase.
