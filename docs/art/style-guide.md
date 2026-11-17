# PlaneShooter — Style Guide: BÁN TẢ THỰC CHIẾN TRƯỜNG (hiện hành)

> **Trạng thái: HIỆN HÀNH từ nhánh `asset/realistic` (18/11/2026).**
> Bản low-poly màu phẳng trước đây (trên nhánh `asset/concept` / `asset/fixes`) đã **LỖI THỜI — bỏ hẳn**, không dùng làm tham chiếu nữa. Chủ repo chốt chuyển sang bán tả thực kiểu Ace Combat 7 / War Thunder, bối cảnh chiến trường đang có chiến tranh.
> Ảnh mẫu: `docs/art/reference/` (warzone_overview.jpg, aircraft_lineup.jpg, base_intact_vs_destroyed.jpg).

## 1. Năm quy tắc chính
1. **Hiện thực điện ảnh, không cartoon** — tỉ lệ thật, vật liệu kim loại/bê tông có phong trần, ánh sáng hoàng hôn điện ảnh.
2. **Mọi thứ phong trần và bị tàn phá** — vết bẩn, rỉ, khói bám trên máy bay; công trình có hố bom, cháy, đổ nát. Không có asset nào "sạch như mới".
3. **Phân cấp tầm nhìn** — máy bay ta sắc nét nhất; càng xa càng mờ dần qua sương/khói (fog + DOF cảm giác), để người chơi luôn đọc được mình và mục tiêu gần.
4. **Môi trường động** — khói đen cuộn, lửa cháy, sóng biển, khói đạn phòng không: chiến trường phải sống, không phải phông tĩnh.
5. **Tương phản u ám vs phát sáng** — nền xanh xám u ám; điểm nhấn là lửa cam, đạn vạch vàng-cam, đốt sau xanh-cam và HUD phát sáng.

## 2. Phe phái & màu nhận diện
| Đối tượng | Màu chủ đạo | Ghi chú |
|---|---|---|
| Tiêm kích ta | Ngụy trang xám xanh kim loại, vết bẩn dầu/khói | Sắc nét nhất khung hình, đốt sau lửa xanh-cam, treo tên lửa |
| Tiêm kích địch | Ngụy trang **nâu sa mạc / đỏ sẫm**, tương phản cao | Phải nhận ra ngay để khóa mục tiêu |
| Ném bom địch | Xám nâu sẫm, to, chậm | Silhouette lớn, khoang bom |
| HUD | Xanh lá `#4ADE80` nét mỏng | Cảnh báo/khóa: đỏ `#FF3333` — chỉ dùng cho nguy hiểm thật |

## 3. Môi trường & ánh sáng
- Ven biển + quần đảo: căn cứ radar, đường băng, tàu chiến bắn phòng không, cụm khói flak đen trên trời.
- Công trình có **2 trạng thái: nguyên vẹn / bị phá** (cháy, sập, hố bom xung quanh) — chuyển trạng thái khi bị đánh.
- Ánh sáng: hoàng hôn chiếu xiên ~15°, bóng dài; sương mù **FogExp2 xám vàng**; nắng xuyên mây (god rays) khi điều kiện cho phép.
- Trời chiều tà u ám, mây dày; biển động có sóng.

## 4. VFX
- **Nổ**: lõi cam sáng → cầu lửa → khói đen đặc + mảnh vỡ văng.
- **Khói đuôi tên lửa**: trắng xám, **đứt quãng** (không phải vệt liền mịn).
- **Đạn vạch (tracer)**: vàng-cam phát sáng, đường thẳng dài.
- **Flak**: cụm khói đen nở tại điểm nổ phòng không.
- **Đốt sau**: lõi xanh, viền cam, rung nhẹ.

## 5. Ba điều tránh
1. Màu quá bão hòa (giữ tông u ám, cháy nổ mới được rực).
2. Asset quá sạch hoặc low-poly/cartoon (phong cách cũ đã bỏ).
3. Cờ, quân hiệu **quốc gia có thật** — chỉ dùng ký hiệu hư cấu (vd chevron/tam giác trừu tượng như ảnh mẫu).

## 6. Ngân sách hiệu năng (web, mục tiêu 60 FPS)
| Đối tượng | Tris | Texture | Ghi chú |
|---|---|---|---|
| Tiêm kích ta | 12k–18k | 2048 (Albedo + ORM + Normal) | GLB Draco + KTX2, < 5MB |
| Địch / ném bom | 5k–9k | 1024 | Chung UV, chỉ đổi texture theo phe |
| Tàu + căn cứ | 3k–6k | Chung 1 atlas 1024 | 2 trạng thái nguyên vẹn/bị phá |
| Địa hình | 15k–25k / cụm đảo | 2048 splatmap | |
| Cây / hố bom / mảnh vỡ | 150–400 | Atlas 512 | **Bắt buộc InstancedMesh** |
| HUD font | — | — | Rajdhani / Share Tech Mono (OFL) như bản cũ |

## 7. Quy ước file (giữ từ bản cũ, vẫn đúng)
- Model GLB: mũi hướng **−Z**, 1 đơn vị = 1 mét, màu/texture theo chuẩn PBR khi có; Draco + KTX2 ở bản production (bản thử nghiệm có thể chưa nén — ghi rõ trong assets.md).
- Skybox: equirectangular 2048×1024.
- Sprite sheet VFX: lưới 4×4.
