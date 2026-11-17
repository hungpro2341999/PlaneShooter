# PlaneShooter — Bộ âm thanh THU ÂM THẬT (nhánh `asset/audio-real`)

Thay toàn bộ bộ synth cũ trên `asset/audio` bằng **tiếng thu âm thật** cho hợp style bán tả thực. **Giữ đúng 21 tên file + bảng ánh xạ sự kiện của bản cũ** để game thay thẳng; thêm 2 âm mới (`aa_gun_distant`, `war_ambience`). Chưa gắn vào game, không sửa code.

Nghe so sánh cũ/mới: `docs/art/audio-preview.html` (cột MỚI = file local, cột CŨ = bản synth trên nhánh asset/audio).

## Nguồn & giấy phép

Toàn bộ từ **Freesound.org**, chỉ lấy **CC0 hoặc CC-BY** (đã kiểm tra trang từng âm; loại NC/ND). Ghi công CC-BY: Aegersum, juskiddink, DCElliott, qubodup (nhạc menu), X3nus — danh sách đầy đủ trong bảng dưới. Các nguồn được phép khác (Sonniss GDC, OpenGameArt, Kenney, Pixabay) đợt này **không cần dùng** vì Freesound đã đủ và chất lượng thu tốt hơn cho từng sự kiện cụ thể.

Lưu ý kỹ thuật: bản gốc Freesound cần tài khoản mới tải được file gốc; đợt này dùng **bản preview HQ chính thức** của Freesound làm nguồn xử lý (đúng bản ghi đó, nén 128–160 kbps). Muốn bản WAV gốc thì đăng nhập và tải lại theo link trong bảng — giấy phép không đổi.

## Thông số (đã kiểm chứng)

- 46 file (23 âm × OGG + MP3), tất cả **44 100 Hz**, tổng **3,22 MB** (< 8 MB).
- Nhạc loudnorm về −16 LUFS: menu −15,1 / combat −15,7 LUFS, true peak ≤ −1,3 dB. SFX chuẩn hoá peak −1,5 dB, đồng đều giữa các file.
- 6 file loop (engine, missile_lock_warning, low_health, music_menu, music_combat, war_ambience): crossfade tại điểm nối, đã đo bước nhảy mẫu ở seam — nằm trong dốc tự nhiên của tín hiệu, không click.
- Xử lý: cắt đoạn tốt nhất theo RMS, fade đầu/cuối, ghép lớp cho nổ lớn và player_hurt, loudnorm riêng cho nhạc.

## Bảng âm thanh → sự kiện → nguồn

| File | Sự kiện | Nguồn (Freesound) | Giấy phép | Dài (s) | Ghi chú xử lý |
|---|---|---|---|---|---|
| `engine_loop` | Động cơ bay (loop, chỉnh rate theo ga) | [F16 fighter jet start up — ikbenraar](https://freesound.org/people/ikbenraar/sounds/322178/) | CC0 | 6.0 | Lấy đoạn turbine ổn định nhất (từ 11,3s), crossfade loop 6s |
| `boost` | Kích hoạt đốt sau | [Afterburner (Close, Screamer) — JSK_Productions](https://freesound.org/people/JSK_Productions/sounds/829068/) | CC0 | 2.4 | Đoạn gầm mạnh nhất 2,4s, fade đuôi |
| `gun` | Súng máy người chơi / phát | [Navy MK 15 Phalanx CIWS Anti-Air Fast Burst — qubodup](https://freesound.org/people/qubodup/sounds/163119/) | CC0 | 0.5 | Cắt 0,5s từ loạt CIWS thật — tiếng rotary cannon đúng chất Vulcan |
| `enemy_gun` | Súng máy địch ở xa | [Distant Machine Gun Firing — qubodup](https://freesound.org/people/qubodup/sounds/854635/) | CC0 | 1.1 | Nguyên đoạn 1,1s |
| `aa_gun_distant` | **MỚI** — pháo phòng không xa | [Cannon artillery – distant gunshots — Aegersum](https://freesound.org/people/Aegersum/sounds/345844/) | CC-BY | 3.1 | Đoạn 3,1s quanh phát bắn rõ nhất, fade đuôi dài |
| `overheat` | Súng quá nhiệt | [steam_burst — pengo_au](https://freesound.org/people/pengo_au/sounds/90143/) | CC0 | 0.93 | Xì hơi 0,93s |
| `missile_launch` | Phóng tên lửa | [M142 HIMARS Rocket Launch 8 — qubodup](https://freesound.org/people/qubodup/sounds/854476/) | CC0 | 2.6 | 2,6s đầu: kích hỏa + rít đi |
| `explosion_large` | Nổ lớn (bomber/căn cứ/player) | [Nearby explosion with debris — juskiddink + lớp Deep Boom — Za-Games](https://freesound.org/people/juskiddink/sounds/108641/) | CC-BY + CC0 | 4.06 | Ghép 2 lớp: nổ có mảnh vỡ + boom trầm trễ 0,15s cho đuôi vang |
| `explosion_small` | Nổ nhỏ (fighter/wreck) | [explosion_long_01 — derplayer](https://freesound.org/people/derplayer/sounds/587197/) | CC0 | 1.9 | Cắt 1,9s, fade đuôi |
| `missile_hit` | Tên lửa nổ trúng đích | [heavy_explosion_sound_03 — Artninja](https://freesound.org/people/Artninja/sounds/826434/) | CC0 | 1.3 | 1,3s quanh đỉnh nổ |
| `hit_impact` | Đạn trúng địch (hit marker) | [hit – metallic 01 — Anthousai](https://freesound.org/people/Anthousai/sounds/406562/) | CC0 | 0.4 | 0,4s |
| `player_hurt` | Người chơi trúng đạn | [bullet ricochet — aust_paul + snd_metal_smash — gristi](https://freesound.org/people/aust_paul/sounds/30932/) | CC0 | 0.55 | Ghép rít đạn + va kim loại 0,55s |
| `lock_beep_locking` | Bíp lúc đang khóa | [Missile Alert! — adh.dreaming](https://freesound.org/people/adh.dreaming/sounds/656060/) | CC0 | 0.14 | 1 bíp đầu 0,14s từ bản ghi cảnh báo thật |
| `lock_beep_locked` | Bíp khóa xong | [Missile Alert! — adh.dreaming](https://freesound.org/people/adh.dreaming/sounds/656060/) | CC0 | 0.5 | Đoạn 0,5s |
| `missile_lock_warning` | Còi tên lửa địch bám (loop) | [Mini Airplane Alarm — CaptainBusiness67](https://freesound.org/people/CaptainBusiness67/sounds/342099/) | CC0 | 1.28 | Chu kỳ alarm 1,28s, crossfade loop |
| `low_health` | Cảnh báo máu thấp (loop) | [Mini Airplane Alarm — CaptainBusiness67](https://freesound.org/people/CaptainBusiness67/sounds/342099/) | CC0 | 1.6 | Đoạn alarm khác, loop 1,6s |
| `wave_start` | Bắt đầu đợt địch | [Dramatic Reveal Rising Brass — Qvantor](https://freesound.org/people/Qvantor/sounds/879278/) | CC0 | 0.9 | Đoạn brass dâng + điểm rơi 0,9s (stereo) |
| `win` | Thắng trận | [Victory Fanfare — Qvantor](https://freesound.org/people/Qvantor/sounds/878608/) | CC0 | 2.8 | 2,8s đầu |
| `lose` | Thua trận | [Dark Crescendo 3 — nomiqbomi](https://freesound.org/people/nomiqbomi/sounds/578577/) | CC0 | 3.0 | 3,0s |
| `ui_click` | Bấm nút UI | [Toggle_Switch — DCElliott](https://freesound.org/people/DCElliott/sounds/386424/) | CC-BY | 0.12 | 1 click công tắc thật 0,12s |
| `music_menu` | Nhạc menu (loop) | [Cinematic Tension Loop Of Epic Proportions — qubodup](https://freesound.org/people/qubodup/sounds/860590/) | CC-BY 4.0 | ? | Loop 8,5s crossfade, loudnorm −16 LUFS (đo −15,1) |
| `music_combat` | Nhạc chiến đấu (loop) | [ww2_1945_action_loop — X3nus](https://freesound.org/people/X3nus/sounds/565185/) | CC-BY | ? | Đoạn căng nhất 32s (từ 63s), crossfade loop, −15,7 LUFS |
| `war_ambience` | **MỚI** — nền chiến trường (loop) | [Strong Wind — keirofinch + Very Distant Explosion — Opticreep + Distant Boom — Henrythetrain](https://freesound.org/people/keirofinch/sounds/376534/) | CC0 | ? | Gió cao 16s loop + 3 tiếng nổ xa thưa, −21 LUFS (nền yên) |

## Ánh xạ vào game

Giữ nguyên bảng ánh xạ `FILES` và cách gắn ở bản cũ (xem git history của file này trên nhánh `asset/audio`): 21 tên file không đổi nên `src/audio.js` chỉ cần trỏ sang bộ file này. Hai âm mới cần điểm gọi thêm: `aa_gun_distant` — phát ngẫu nhiên xa khi gần tàu/căn cứ có phòng không; `war_ambience` — loop nền trong lúc `play`, gain ~0,25, phát cùng `engine_loop`.

## Chưa làm được / giới hạn

- Chưa nghe bằng tai người trong trình duyệt thật — kiểm chứng bằng số đo (loudness, peak, seam) + trang preview để chủ repo nghe duyệt.
- Nguồn là preview HQ của Freesound (xem lưu ý trên); 2 âm nhạc là bản ghi/biểu diễn của cộng đồng, không phải dàn nhạc thu studio — nếu cần chất lượng phòng thu thì bước tiếp theo là lấy WAV gốc hoặc đặt hàng riêng.
- Chưa gắn vào game (đúng phạm vi): việc tích hợp thuộc chat CODE.
