# Sketchfab Shortlist — chờ API token của chủ repo

Đã lọc theo: có nút Download, giấy phép **CC0 hoặc CC-BY** (loại NC/ND/Editorial), tiêm kích phản lực hiện đại / ném bom / tàu chiến. Số tris lấy từ trang model công khai ngày 18/11/2026.
Trạng thái tất cả: **CHƯA TẢI** — chờ chủ repo dán Sketchfab API token vào chat ASSET. Token chỉ dùng trong phiên làm việc, không lưu vào repo/file.

| Vai trò | Model | Tác giả | Giấy phép | Tris gốc | Ngân sách đích | Ghi chú quân hiệu |
|---|---|---|---|---|---|---|
| Tiêm kích ta (hero) | [Lowpoly Eurofighter Typhoon F2](https://sketchfab.com/3d-models/lowpoly-eurofighter-typhoon-f2-e870911a25f84f67a65201ae5de9cea1) | SIpriv (@S1Priv) | CC-BY | 13.3k | 12k–18k (gần như giữ nguyên) | Có thể mang dấu RAF — gỡ/thay bằng ký hiệu hư cấu khi reskin bằng bộ PBR xám xanh |
| Tiêm kích địch 1 | [Lowpoly F16 Block 70](https://sketchfab.com/3d-models/lowpoly-f16-block-70-52c6f5ad114c48adad7a3205a53a56ab) | SIpriv (@S1Priv) | CC-BY | 8.1k | 5k–9k (giữ nguyên) | Reskin nâu sa mạc/đỏ sẫm bằng bộ PBR địch |
| Tiêm kích địch 2 / biến thể | [Low poly F-35 Lightning II](https://sketchfab.com/3d-models/low-poly-f-35-lightning-ii-561b5c56fbf94636a465f998e9af1224) | SIpriv (@S1Priv) | CC-BY | 7.7k | 5k–9k (giữ nguyên) | Cùng tác giả 2 model trên — style đồng nhất, lợi thế lớn |
| Ném bom địch | [Alkyon AB-4 — Nuclear Option Fictional Bomber](https://sketchfab.com/3d-models/alkyon-ab-4-nuclear-option-fictional-bomber-16598e47089c4eae921679e493a40116) | mgg8 | **CC0** | Chưa hiển thị công khai — xác minh khi tải qua API | 5k–9k (giảm nếu cần) | Máy bay **hư cấu** — không có quân hiệu quốc gia thật, hợp style guide nhất |
| Tàu chiến (phòng không) | [JS Kongo DDG 173](https://sketchfab.com/3d-models/js-kongo-ddg-173-9fd3964c780b4ef497bb061e05e77253) | SB-129 (@hrd4588) | CC-BY | 905.6k | 3k–6k (giảm mạnh, giữ silhouette + tháp pháo) | Khu trục hạm hiện đại; cờ/dấu hải quân Nhật nếu có phải gỡ khi reskin |

Đã loại khi lọc (ghi để khỏi tìm lại): MiG-21PFM của OUTPISTON (CC-BY-NC-SA), F/A-18E + AV-8B + Viggen của 42manako (CC-BY-NC, và là model rip từ game khác), Gripen 768k tris CC-BY của ngkoret (quá nặng + cockpit chi tiết không cần), Damaged Fighter Jet Wreck 539k tris (chỉ hợp làm xác cháy tĩnh, để dành nếu cần prop).

## Việc làm ngay khi có token
1. Tải bản glTF của 5 model qua Sketchfab Download API.
2. Kiểm tra tris thật + quân hiệu có trong texture không; gỡ/thay quân hiệu thật.
3. Giảm tris về ngân sách (Typhoon/F-16/F-35 gần như giữ nguyên; Kongo giảm mạnh), xoay mũi −Z, gắn bộ texture PBR đã làm (chung UV layout) hoặc reskin theo style guide.
4. Nén Draco + KTX2, kiểm mỗi máy bay < 5MB, ghi công CC-BY vào `docs/assets.md`.
