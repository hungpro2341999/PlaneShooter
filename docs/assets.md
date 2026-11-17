# PlaneShooter — Asset Inventory (nhánh asset/realistic, style bán tả thực)

Style hiện hành: `docs/art/style-guide.md` (bán tả thực chiến trường). Kế hoạch thay asset: `docs/art/asset-plan.md`.
Asset tự tạo của dự án phát hành **CC0 1.0**. Ảnh trong `docs/art/reference/` do AI tạo cho dự án, **chỉ dùng làm tham chiếu phong cách**, không phải asset trong game.

| Asset | Đường dẫn | Nguồn | Giấy phép | Ghi chú |
|---|---|---|---|---|
| Ảnh tham chiếu cảnh chiến đấu tổng thể | `docs/art/reference/warzone_overview.jpg` | AI tạo theo mô tả chủ repo | Dùng nội bộ dự án | Tiêm kích ta sau lưng, đảo bị ném bom, tàu bắn flak, god rays |
| Ảnh tham chiếu 3 loại máy bay | `docs/art/reference/aircraft_lineup.jpg` | AI tạo theo mô tả chủ repo | Dùng nội bộ dự án | Ta xám xanh / địch nâu sa mạc-đỏ sẫm / ném bom xám nâu |
| Ảnh tham chiếu căn cứ 2 trạng thái | `docs/art/reference/base_intact_vs_destroyed.jpg` | AI tạo theo mô tả chủ repo | Dùng nội bộ dự án | Trái nguyên vẹn, phải bị phá |
| Style guide bán tả thực | `docs/art/style-guide.md` | Tự viết | CC0 | Thay bản low-poly cũ (đã lỗi thời) |
| Asset plan | `docs/art/asset-plan.md` | Tự viết | CC0 | Nguồn đề xuất + ngân sách + ưu tiên |
| **Model tiêm kích ta (thử)** | `public/assets/models/player_fighter_real.glb` | Tự dựng (trimesh) | CC0 | **13.584 tris** (ngân sách 12k–18k), 810KB, mũi −Z, màu ngụy trang xám xanh ở vertex color COLOR_0, chưa PBR/Draco/KTX2 |
| **Model tiêm kích địch (thử)** | `public/assets/models/enemy_fighter_real.glb` | Tự dựng (trimesh) | CC0 | **5.848 tris** (ngân sách 5k–9k), 350KB, mũi −Z, ngụy trang nâu sa mạc + vây đỏ sẫm ở COLOR_0 |
| **Skybox chiều tà u ám (thử)** | `public/assets/textures/skybox_warzone_dusk.png` | Tự vẽ (code) | CC0 | Equirect 2048×1024, mây dày, god rays nhẹ, khói xa; bản mood thử — production nên thay HDRI Poly Haven CC0 |
| **Sprite sheet nổ thật (thử)** | `public/assets/vfx/explosion_real_sheet.png` | Tự vẽ (code) | CC0 | 4×4 1024: lõi cam → cầu lửa → khói đen + mảnh vỡ tia lửa |
| **Sprite sheet khói đen (thử)** | `public/assets/vfx/black_smoke_sheet.png` | Tự vẽ (code) | CC0 | 4×4 1024, khói đen đặc nở và tan |
| Preview 2 model thử | `docs/art/previews/player_fighter_real_preview.png`, `enemy_fighter_real_preview.png` | Render từ GLB | CC0 | 3 góc: 3/4, cạnh, trên |
| Preview skybox + VFX thử | `docs/art/previews/warzone_trial_preview.png` | Ghép từ asset | CC0 | |

## Chưa có ở bộ thử (theo asset-plan)
Texture PBR 2048 (Albedo/ORM/Normal) cho máy bay, nén Draco + KTX2, model ném bom/tàu/căn cứ 2 trạng thái, địa hình splatmap, khói đuôi tên lửa, decal ký hiệu hư cấu. Xem `docs/art/asset-plan.md` mục trạng thái.

## Lượt 2 (18/11/2026) — sửa theo review

| File | Nội dung | Nguồn / giấy phép |
|---|---|---|
| public/assets/textures/skybox_warzone_dusk_hdri.jpg (+ _4k.jpg) | Skybox equirect 2048×1024 + bản 4K, thay bản vẽ tay (đã xóa skybox_warzone_dusk.png) | HDRI **wasteland_clouds_puresky** của Poly Haven, **CC0**; tải qua api.polyhaven.com, tonemap Hable + chỉnh màu ấm xám vàng, giảm sáng −1.25 stop theo style guide; không vẽ khói vào sky (khói để particle sau) |
| public/assets/textures/jet_player_albedo.jpg / jet_player_orm.webp / jet_player_normal.png | Bộ PBR 2048 máy bay ta: ngụy trang xám xanh, panel line, đinh tán, xước mép cánh, vệt dầu đuôi, ký hiệu hư cấu (chevron + mã VX-07) | Tự làm bằng code (PIL/numpy), CC0 của dự án; layout UV dùng chung với địch (xem docs/art/decisions.md) |
| public/assets/textures/jet_enemy_albedo.jpg / jet_enemy_orm.webp / jet_enemy_normal.png | Bộ PBR 2048 địch: nâu sa mạc + điểm nhấn đỏ sẫm ở đuôi, cùng UV layout | Tự làm bằng code, CC0 của dự án |
| public/assets/vfx/explosion_real_sheet.png | **Làm lại v2**: 16 frame đều có hình, frame đầu cầu lửa đã lớn, lửa cuộn 3 lớp có texture, mảnh vỡ viền nóng + tia lửa, cuối chuyển khói đen đặc không frame trống | Tự làm bằng code, CC0 |
| public/assets/vfx/missile_contrail_sheet.png | MỚI: khói đuôi tên lửa trắng xám, puff đứt quãng, đầu nóng sáng, vệt dài dần theo frame | Tự làm bằng code, CC0 |
| public/assets/vfx/flak_sheet.png | MỚI: cụm khói flak đen lổn nhổn, nở + tan, giữ đậm tới cuối | Tự làm bằng code, CC0 |
| docs/art/sketchfab-shortlist.md | Danh sách 5 model Sketchfab (3 tiêm kích SIpriv CC-BY, ném bom Alkyon CC0, tàu Kongo CC-BY) kèm tris gốc — **chờ token** | Chỉ liệt kê, chưa tải |
| docs/art/previews/vfx_v2_preview.png, skybox_hdri_preview.png, comparison_vs_reference.png | Preview lượt 2 + ảnh ghép so sánh trial hiện tại với ảnh tham chiếu | — |

Giới hạn lượt 2 (nói thẳng): bộ PBR là texture theo UV layout chuẩn đã định (thân giữa, cánh 2 bên, bụng dưới) — model GLB trial hiện tại vẫn là vertex color, chưa có UV khớp layout này; khi model Sketchfab về sẽ unwrap theo layout này hoặc reskin trực tiếp. Chưa nén KTX2 cho texture (JPG/WebP/PNG hiện tại đều < 700KB/bản đồ).
