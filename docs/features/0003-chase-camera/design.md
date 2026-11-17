# 0003 — Design
- Vị trí mong muốn = vị trí máy bay − forward×distance + up×height, rồi kẹp theo heightAt (D-006).
- Damping mũ không phụ thuộc framerate: k = 1 − exp(−damping×dt) cho cả vị trí và điểm nhìn (smoothedLook).
- Frame đầu tiên snap thẳng tới vị trí mong muốn để không có cú lia từ gốc tọa độ.
