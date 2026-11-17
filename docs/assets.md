# PlaneShooter — Asset Inventory

Mọi asset trong repo này do chính dự án tạo ra (vẽ/dựng bằng code), phát hành **CC0 1.0** — dùng thương mại tự do, không cần ghi công. Tác giả ghi chung: **PlaneShooter project (procedural, Muse hỗ trợ tạo)**.
Font chỉ là gợi ý trong `docs/art/style-guide.md` (Google Fonts, OFL), chưa nhúng file font.

| Asset | Đường dẫn | Nguồn | Giấy phép | Tác giả |
|---|---|---|---|---|
| Style guide | `docs/art/style-guide.md` | Tự viết | CC0 | PlaneShooter project |
| Art decisions | `docs/art/decisions.md` | Tự viết | CC0 | PlaneShooter project |
| Concept máy bay người chơi | `docs/art/concepts/player_fighter.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Concept tiêm kích địch | `docs/art/concepts/enemy_fighter.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Concept máy bay ném bom | `docs/art/concepts/enemy_bomber.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Concept đảo ban ngày | `docs/art/concepts/island_day.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Concept đảo hoàng hôn | `docs/art/concepts/island_sunset.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Model máy bay người chơi (GLB, 612 tris, 65KB, có chi tiết tiêm kích: cánh quét, 2 vây đứng, họng hút, tên lửa đầu cánh/dưới cánh) | `public/assets/models/player_fighter.glb` | Tự dựng low-poly (trimesh) — xem decisions.md mục 2 | CC0 | PlaneShooter project |
| Model tiêm kích địch (GLB, ~232 tris, 29KB) | `public/assets/models/enemy_fighter.glb` | Tự dựng low-poly (trimesh) | CC0 | PlaneShooter project |
| Model máy bay ném bom (GLB, ~492 tris, 51KB) | `public/assets/models/enemy_bomber.glb` | Tự dựng low-poly (trimesh) | CC0 | PlaneShooter project |
| Model căn cứ radar (GLB, ~164 tris, 21KB) | `public/assets/models/radar_base.glb` | Tự dựng low-poly (trimesh) | CC0 | PlaneShooter project |
| Model tàu tuần tra (GLB, ~110 tris, 16KB, mũi tàu dạng nêm liền thân) | `public/assets/models/ship.glb` | Tự dựng low-poly (trimesh) | CC0 | PlaneShooter project |
| Skybox ban ngày (equirect 2048×1024) | `public/assets/textures/skybox_day.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Skybox hoàng hôn (equirect 2048×1024) | `public/assets/textures/skybox_sunset.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Texture cát đảo 1024 (seamless, lát liền mạch) | `public/assets/textures/island_sand.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Texture cỏ/rừng đảo 1024 (seamless) | `public/assets/textures/island_grass.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Texture đá đảo 1024 (seamless) | `public/assets/textures/island_rock.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Texture mặt nước 1024 (seamless) | `public/assets/textures/water.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Sprite sheet nổ 4×4, 1024 | `public/assets/vfx/explosion_sheet.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Ảnh kiểm tra lát texture 2×2 | `docs/art/checks/textures_2x2_check.png` | Tự chụp từ 4 texture đã lát | CC0 | PlaneShooter project |
| Sprite sheet khói 4×4, 1024 | `public/assets/vfx/smoke_sheet.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Mockup HUD | `docs/art/mockups/hud_mockup.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Mockup menu chính | `docs/art/mockups/main_menu_mockup.png` | Tự vẽ (code) | CC0 | PlaneShooter project |
| Sprite tâm ngắm 256, nền trong | `public/assets/ui/crosshair.png` | Tách từ mockup HUD | CC0 | PlaneShooter project |
| Sprite vòng khóa mục tiêu 256, nền trong | `public/assets/ui/lock_on.png` | Tách từ mockup HUD | CC0 | PlaneShooter project |
| Sprite khung radar 512, nền trong | `public/assets/ui/radar_frame.png` | Tách từ mockup HUD | CC0 | PlaneShooter project |
| Icon tên lửa 256, nền trong | `public/assets/ui/missile_icon.png` | Tách từ mockup HUD | CC0 | PlaneShooter project |

## Preview 3D (render từ chính file GLB, 3 góc: 3/4 — cạnh — trên)
| Model | Preview |
|---|---|
| player_fighter.glb | `docs/art/previews/player_fighter_preview.png` |
| enemy_fighter.glb | `docs/art/previews/enemy_fighter_preview.png` |
| enemy_bomber.glb | `docs/art/previews/enemy_bomber_preview.png` |
| radar_base.glb | `docs/art/previews/radar_base_preview.png` |
| ship.glb | `docs/art/previews/ship_preview.png` |

## Quy ước dùng trong code
- Model GLB: mũi hướng **-Z** (quy ước mới của dự án, khớp code Three.js), 1 đơn vị = 1 mét, normals phẳng (flat, geometry không index).
- Màu của model nằm ở **vertex color (COLOR_0)**, KHÔNG phải material — material trong GLB là mặc định; muốn đổi màu thì sửa vertex color, đừng tìm material theo màu.
- Skybox: nạp bằng `THREE.TextureLoader`, đặt `mapping = EquirectangularReflectionMapping`.
- Sprite sheet VFX: lưới 4×4, chạy frame theo hàng từ trái sang phải, trên xuống dưới.
- Nguồn ngoài (Kenney/Poly Pizza) đã thử nhưng không tải được từ máy build — chi tiết ở `docs/art/decisions.md` mục 2.
