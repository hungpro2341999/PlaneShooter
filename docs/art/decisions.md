# Art Decisions — asset/concept

Ghi lại các quyết định tự chốt khi đề bài chưa rõ (theo yêu cầu: không hỏi lại giữa chừng).

1. **Nơi làm việc**: dùng worktree riêng `~/workspace/PlaneShooter-asset` (nhánh `asset/concept` từ `main`) để không giẫm chat CODE đang ở nhánh `code/phase-0-1` trong thư mục chính.
2. **Model GLB — đổi cách làm**: đã thử nguồn ngoài trước: Kenney (kenney.nl) trả 403 Forbidden từ máy này, Poly Pizza API đòi API token cá nhân. Thay vì chờ, toàn bộ 5 model được **tự dựng low-poly bằng code** (trimesh, primitives mặt phẳng), tô đúng bảng màu style guide, xuất GLB < 2MB, và **phát hành CC0 do chính dự án tạo** — code game dùng ngay được, không vướng giấy phép bên thứ ba. Nếu sau này muốn thay bằng model Kenney/Quaternius chi tiết hơn, giữ nguyên tên file + quy ước mũi +Z là thay thẳng được.
3. **Concept art**: vẽ dạng minh họa low-poly màu phẳng (đúng style game) thay vì tranh tả thực — concept phải khớp sản phẩm cuối.
4. **docs/assets.md đặt ở `docs/`** theo đúng mục (6) của đề bài, dù phạm vi ghi chính là `public/assets/` + `docs/art/`.
5. **Skybox**: xuất dạng equirectangular PNG 2048×1024 (Three.js `EquirectangularReflectionMapping` / scene.background) thay vì 6 mặt cube rời — ít file, nhẹ, đủ cho Phase này.
6. **Quy ước model**: mũi hướng +Z, 1 đơn vị = 1 mét, origin giữa thân. Radar dish và tàu là model tĩnh, không rig/animation.
7. **Font**: chỉ ghi gợi ý + tên font (OFL), chưa nhúng file font vào repo — code Phase sau tự nạp Google Fonts.

8. **Đổi quy ước hướng (asset/fixes)**: toàn bộ 5 GLB xuất lại với mũi hướng **-Z** (xoay 180° quanh Y so với bản +Z cũ), geometry chuyển không-index + normals theo mặt để Three.js shade phẳng đúng ý low-poly. Kích thước file tăng nhẹ (25–65KB) vì geometry không-index, vẫn xa dưới hạn 2MB.
9. **Ghi đúng nơi chứa màu**: màu model thực tế nằm ở vertex color COLOR_0 (kiểm chứng khi nạp GLB: visual kind = vertex), tài liệu cũ ghi "material" là sai — đã sửa ở assets.md và style-guide.
10. **Texture seamless (asset/fixes)**: 4 texture đảo/nước vẽ lại với hình khảm wrap-around (vẽ lặp ở 9 ô lệch) nên lát không lộ đường nối, giảm số mảnh tam giác (~420 → ~110) và hạ tương phản cho hợp màu phẳng. Ảnh kiểm tra lát 2×2 ở `docs/art/checks/textures_2x2_check.png`.
