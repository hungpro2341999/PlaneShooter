# 0007 — Design
- Spawn theo event `enemy:spawn` từ waves (0008); mỗi địch 1 AiState (mode/phase/fireTimer/evadeUntil).
- Lái bằng steering giới hạn turnRate về hướng mong muốn; tránh địa hình bằng heightAt phía trước + sàn độ cao.
- Né: nghe `missile:lock` (đã khóa hẳn) và `missile:launched` -> evadeUntil; jink = quặt vuông góc + lên/xuống dao động.
- Đạn địch dùng chung ProjectileSystem (faction enemy, tracer đỏ cam). Căn cứ radar = đảo radius lớn nhất trong balance.world.
