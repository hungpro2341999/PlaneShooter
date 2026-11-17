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
