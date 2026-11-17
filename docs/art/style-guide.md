# PlaneShooter — Art Style Guide

Game WEB 3D không chiến (Three.js) · Low-poly, màu phẳng (flat color, không texture chi tiết trên model) · Quần đảo nhiệt đới giữa biển, căn cứ radar trên đảo lớn.

## 1. Bảng màu (hex)

### Môi trường
| Tên | Hex | Dùng cho |
|---|---|---|
| Sky Day Top | `#2E7FC2` | Đỉnh bầu trời ban ngày |
| Sky Day Horizon | `#BFE8F2` | Chân trời ban ngày |
| Sky Sunset Top | `#3B3A6B` | Đỉnh bầu trời hoàng hôn |
| Sky Sunset Mid | `#FF8C5A` | Tầng giữa hoàng hôn |
| Sky Sunset Horizon | `#FFD29D` | Chân trời hoàng hôn |
| Ocean Deep | `#0B3D5C` | Biển sâu |
| Ocean | `#146B8A` | Mặt biển |
| Ocean Shallow | `#3EC1C9` | Nước nông quanh đảo |
| Sand | `#EAD9A0` | Bãi cát |
| Jungle | `#2E7D4F` | Cây cối đảo |
| Jungle Dark | `#1E5B38` | Bóng cây / rừng rậm |
| Rock | `#7A7F85` | Đá, vách núi |
| Concrete | `#B8BFC4` | Công trình căn cứ |

### Máy bay & phe phái
| Tên | Hex | Dùng cho |
|---|---|---|
| Player Body | `#DDE6E8` | Thân máy bay người chơi |
| Player Accent | `#22C3D6` | Điểm nhấn cyan: cánh, sọc thân |
| Player Dark | `#2B3A42` | Kính buồng lái, chi tiết tối |
| Enemy Red | `#C1272D` | Tiêm kích địch (màu nhận diện chính) |
| Enemy Gray | `#6B7280` | Tiêm kích/ném bom địch |
| Enemy Dark | `#374151` | Chi tiết tối phe địch |
| Bomber Rust | `#8E2A2A` | Điểm nhấn máy bay ném bom |

### HUD (quân sự, nét mảnh)
| Tên | Hex | Dùng cho |
|---|---|---|
| HUD Green | `#4ADE80` | Nét HUD chính, tâm ngắm, radar |
| HUD Cyan | `#22D3EE` | Vòng khóa mục tiêu, thông tin phụ |
| HUD Text | `#D1FAE5` | Chữ/số trên HUD |
| HUD Warning | `#EF4444` | **CHỈ** cảnh báo: trúng đạn, tên lửa đuổi, máu thấp |
| HUD Amber | `#FBBF24` | Lưu ý nhẹ (không phải nguy hiểm) |

Quy tắc màu HUD: đỏ không dùng trang trí. Thấy đỏ = nguy hiểm thật.

## 2. Quy tắc low-poly
- Model: mặt phẳng (flat shading), không bevel mềm, không normal map chi tiết. Mỗi model < 2MB GLB.
- Ngân sách poly gợi ý: máy bay người chơi ≤ 3.000 tris, tiêm kích địch ≤ 2.000, ném bom ≤ 4.000, công trình/tàu ≤ 3.000.
- Màu nằm ở vật liệu (vertex/PBR base color), không vẽ texture lên model máy bay.
- 1 model = 1 file GLB, mũi máy bay hướng **+Z**, tâm ở giữa thân, đơn vị mét.
- Texture môi trường: tối đa 2048px, ưu tiên 1024px, PNG (hoặc WebP khi code hỗ trợ).
- Sprite UI/VFX: PNG nền trong suốt, lưới sprite sheet đều ô (4×4 cho nổ/khói).

## 3. Font gợi ý cho HUD
Tất cả đều Google Fonts, giấy phép OFL (dùng thương mại được):
- **Rajdhani** (SemiBold) — tiêu đề HUD, menu chính: nét kỹ thuật, quân sự.
- **Share Tech Mono** — số liệu bay (cao độ, tốc độ, đạn): monospace, đọc nhanh.
- **Orbitron** (tùy chọn) — logo / màn hình chính, dùng ít.

## 4. Ánh sáng & không khí
- Ban ngày: sáng rõ, bão hòa vừa, biển xanh ngọc là điểm nhấn nhiệt đới.
- Hoàng hôn: cam/hồng chủ đạo, silhouette máy bay và đảo phải đọc rõ.
- Không dùng hiệu ứng hậu kỳ nặng; game web cần nhẹ.
