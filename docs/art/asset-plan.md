# Asset Plan — chuyển style sang bán tả thực (asset/realistic)

Nguồn đề xuất đều là nguồn cho phép dùng thương mại; **bắt buộc kiểm giấy phép trên trang từng asset trước khi tải** (quy trình skill source-assets). "Tự làm" = dựng bằng code/modeling trong dự án, phát hành CC0 của dự án.
Trạng thái: ✅ đã có bản thử · ⬜ chưa làm.

| # | Asset cần thay | Nguồn đề xuất | Ngân sách | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| 1 | Tiêm kích ta (hero) | Tự làm (bản thử đợt này) → hoặc Sketchfab CC0/CC-BY "fighter jet" rồi reskin ngụy trang xám xanh | 12k–18k tris, tex 2048 PBR, <5MB | P0 | ✅ bản thử GLB |
| 2 | Tiêm kích địch | Tự làm, chung UV với bản ta, texture nâu sa mạc/đỏ sẫm | 5k–9k tris, tex 1024 | P0 | ✅ bản thử GLB |
| 3 | Ném bom địch | Sketchfab CC-BY/CC0 hoặc tự làm từ khung địch kéo dài | 5k–9k tris, tex 1024 | P1 | ⬜ |
| 4 | Skybox chiều tà u ám + mây dày | Tự làm (đợt này) / Poly Haven HDRI (CC0) convert equirect | 2048×1024 | P0 | ✅ bản thử |
| 5 | Sprite nổ (lõi cam + khói đen + mảnh vỡ) | Tự làm (đợt này) | Sheet 4×4 1024 | P0 | ✅ bản thử |
| 6 | Sprite khói đen / khói đuôi tên lửa trắng xám đứt quãng | Tự làm (đợt này: khói đen) | Sheet 4×4 1024 | P0 | ✅ khói đen · ⬜ khói tên lửa |
| 7 | Địa hình quần đảo chiến trường (splatmap, hố bom) | Tự làm heightmap + ambientCG (CC0) cho splat layers | 15k–25k tris/cụm, splat 2048 | P1 | ⬜ |
| 8 | Căn cứ radar + đường băng — 2 trạng thái | Tự làm / Quaternius (CC0) reskin phong trần | 3k–6k tris, atlas 1024 | P1 | ⬜ |
| 9 | Tàu chiến + pháo phòng không | Tự làm / Sketchfab CC0 | 3k–6k tris, atlas 1024 | P1 | ⬜ |
| 10 | Cây, hố bom, mảnh vỡ (instanced) | Tự làm + Kenney (CC0, nếu tải được) | 150–400 tris, atlas 512, InstancedMesh | P1 | ⬜ |
| 11 | Texture PBR mặt đất/kim loại/bê tông (Albedo/ORM/Normal) | ambientCG + Poly Haven (đều CC0) | 1024–2048, KTX2 | P1 | ⬜ |
| 12 | Đạn vạch, flak, đốt sau (VFX bổ sung) | Tự làm (shader/sprite) | Nhẹ, additive | P2 | ⬜ |
| 13 | HUD đỏ cảnh báo #FF3333 + khóa mục tiêu | Tự làm từ sprite HUD hiện có, đổi màu cảnh báo | — | P2 | ⬜ |
| 14 | Nén production: Draco cho GLB + KTX2 cho texture | gltfpack / gltf-transform (tooling, không phải asset) | Mỗi máy bay <5MB | P1 | ⬜ |

Nguyên tắc chọn nguồn: CC0 > CC-BY (ghi công trong docs/assets.md) > tự làm. Loại NC và "personal use only".
