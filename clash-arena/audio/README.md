# CLASH ARENA — Bộ âm thanh (Audio Pack)

Game đối kháng 3D anime (1 người vs máy). Nhân vật: **KAI** (kiếm sĩ, kiếm phát sáng cyan) và **RIN** (nữ võ sĩ quyền cước, găng tay kim loại, lửa).

- **21 tên file × 2 định dạng** (OGG + MP3) = 42 file, tất cả **44.1 kHz**.
- SFX mono, nhạc stereo. Peak chuẩn hoá −1.2 đến −3 dB tuỳ loại, âm lượng đồng đều.
- `bgm_menu` và `bgm_fight` là **loop nối liền không click** (crossfade ở điểm nối, đã đo độ nhảy biên khi vòng lặp ≈ mức nhiễu nền của chính file).
- **Tổng dung lượng audio: ~2.3 MB** (giới hạn 8 MB).
- Mọi nguồn đều **CC0 hoặc CC-BY** (dùng được thương mại), không NC/ND/SA. Các file CC-BY **bắt buộc ghi công** — xem mục Attribution ở cuối.

## Tải file qua raw GitHub

Nhánh `clash-arena-audio`, thư mục `clash-arena/audio/`:

```
https://raw.githubusercontent.com/hungpro2341999/PlaneShooter/clash-arena-audio/clash-arena/audio/<tên-file>.ogg
https://raw.githubusercontent.com/hungpro2341999/PlaneShooter/clash-arena-audio/clash-arena/audio/<tên-file>.mp3
```

## Bảng file → nguồn / giấy phép / âm lượng gợi ý

Âm lượng gợi ý là mức `volume` 0.0–1.0 khi phát trong game (trước master bus).

| File | Thời lượng | Nguồn gốc (file gốc) | Tác giả | Giấy phép | Vol gợi ý |
|---|---|---|---|---|---|
| `hit_light` | 0.30s | "37 Hits/Punches" — `hit09` (OpenGameArt) | Independent.nu (Ljudbank) | CC0 | 0.8 |
| `hit_heavy` | 0.61s | "37 Hits/Punches" — `hit37`, hạ pitch 10% cho nặng | Independent.nu (Ljudbank) | CC0 | 1.0 |
| `block` | 0.32s | "Sword Clash" — `sword_clash.2` (OpenGameArt) | StarNinjas | CC0 | 0.8 |
| `whoosh` | 0.22s | "Swishes Sound Pack" — `swish-9` (OpenGameArt) | artisticdude | CC0 | 0.6 |
| `jump` | 0.38s | "Jump Landing" — `Jump 1` (OpenGameArt) | Macro | CC0 | 0.7 |
| `land` | 0.30s | Ghép lớp: "Impact" — `impact.10` + `hit09` lọc trầm (OpenGameArt) | StarNinjas + Independent.nu | CC0 | 0.9 |
| `throw` | 0.18s | "Swishes Sound Pack" — `swish-3`, hạ pitch 20% | artisticdude | CC0 | 0.7 |
| `special` | 1.30s | "8 RPG Battle Magic SFX" (bản free sample) — `45_Charge_05`, lấy đoạn nạp năng lượng dâng cao nhất (OpenGameArt) | Leohpaz | **CC-BY 4.0** | 0.85 |
| `super` | 1.90s | Ghép lớp: `04_Fire_explosion_04_medium` (Leohpaz) + "Deep Boom" #539968 (Freesound) | Leohpaz + Za-Games | **CC-BY 4.0** + CC0 | 1.0 |
| `ko` | 1.07s | "Announcer Voice Pack (Fighting, Female)" — `ko.wav`, giọng đọc "K.O." (OpenGameArt) | Aimee Smith | **CC-BY 4.0** | 1.0 |
| `round_start` | 1.15s | Cùng pack trên — `round_1.wav`, giọng đọc "Round One" | Aimee Smith | **CC-BY 4.0** | 1.0 |
| `fight` | 0.60s | Cùng pack trên — `fight.wav`, giọng đọc "Fight!" | Aimee Smith | **CC-BY 4.0** | 1.0 |
| `perfect` | 0.78s | Cùng pack trên — `perfect.wav`, giọng đọc "Perfect" | Aimee Smith | **CC-BY 4.0** | 1.0 |
| `menu_move` | 0.04s | Kenney Interface Sounds — `tick_001` (qua OpenGameArt) | Kenney | CC0 | 0.5 |
| `menu_select` | 0.29s | Kenney Interface Sounds — `confirmation_001` (qua OpenGameArt) | Kenney | CC0 | 0.6 |
| `bgm_menu` (loop) | 13.77s | "Menu Loop" (OpenGameArt), crossfade vòng lặp 1.0s | Akikazer | CC0 | 0.35 |
| `bgm_fight` (loop) | 50.86s | "Boss Battle #6 Metal" V1 (OpenGameArt), crossfade vòng lặp 1.5s — metal/electronic nhanh, hợp không khí đối kháng | nene | CC0 | 0.5 |
| `sword_slash` (KAI) | 0.44s | "Sword" — `sword.4` (OpenGameArt) | StarNinjas | CC0 | 0.7 |
| `sword_hit` (KAI) | 0.40s | "Sword Clash" — `sword_clash.5` (OpenGameArt) | StarNinjas | CC0 | 0.85 |
| `punch_metal` (RIN) | 0.35s | Ghép lớp: `hit12` (Independent.nu) + "Metal Interactions" — `metal_interaction2` (qubodup), cả hai trên OpenGameArt | Independent.nu + qubodup | CC0 | 0.9 |
| `fire_burst` (RIN) | 1.05s | "8 RPG Battle Magic SFX" (bản free sample) — `04_Fire_explosion_04_medium` (OpenGameArt) | Leohpaz | **CC-BY 4.0** | 0.9 |

## Attribution (bắt buộc với file CC-BY)

Đưa đoạn ghi công sau vào phần credits của game:

```
Announcer voice ("Round One", "Fight!", "K.O.", "Perfect") performed by Aimee Smith
(www.aimeesmithva.com) — "Announcer Voice Pack (Fighting, Female)", CC-BY 4.0.
Magic/fire sound effects (special, super, fire_burst) by Leohpaz —
"RPG Battle Magic SFX", CC-BY 4.0.
"Deep Boom" layer in super by Za-Games (Freesound #539968), CC0.
```

Các nguồn CC0 còn lại (Independent.nu, StarNinjas, artisticdude, Macro, Kenney, Akikazer, nene, qubodup) không bắt buộc ghi công, nhưng nên ghi để tri ân tác giả.

## Ghi chú xử lý

- Cắt đầu theo onset (bỏ khoảng lặng đầu file gốc), fade đầu/cuối chống click, chuẩn hoá peak đồng đều giữa các đòn: light < heavy < super.
- `hit_heavy` và `throw` được hạ pitch từ chính file gốc CC0 để tăng lực — nội dung không đổi nguồn/gốc giấy phép.
- Giọng phát thanh viên là **bản thu âm thật** (không phải giọng tổng hợp), cả 4 câu cùng một giọng nữ (Aimee Smith) để nhất quán.
