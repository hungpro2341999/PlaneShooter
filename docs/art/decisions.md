# Decisions — asset/audio (2026-11-17)

Các điểm chưa rõ trong yêu cầu, tự quyết và ghi lại ở đây.

## Nguồn âm: tự synth bằng code, không tải thư viện ngoài

- Đọc `src/audio.js` trên `main` (bản bash.tv) cho thấy game đang dùng âm
  procedural Web Audio với công thức rõ ràng (tần số, sweep, nhịp bíp).
  Quyết định: **tổng hợp lại đúng các công thức đó thành file** bằng
  Python (numpy/scipy) + ffmpeg. Lợi: âm sắc khớp game hiện tại, giấy phép
  sạch tuyệt đối (CC0, không phụ thuộc trang tải nào — tránh lặp lại sự cố
  Kenney 403 / Poly Pizza đòi token ở đợt asset trước), kiểm soát chính xác
  loop/loudness. Đánh đổi: chất âm synth thuần, không "thật" như sample thu
  âm; chấp nhận được cho game arcade low-poly.

## Vượt danh sách tối thiểu: +2 file

- `enemy_gun`: game có `Sfx.enemyGun()` riêng (gọi khi địch bắn, giảm âm theo
  khoảng cách) — tách file riêng thay vì dùng chung `gun` để giữ cân bằng
  nghe như bản procedural.
- `player_hurt`: yêu cầu ghi "trúng đạn" (1 mục) nhưng game có 2 sự kiện
  khác nhau — đạn trúng địch (`hit()`) và người chơi trúng đạn (`hurt()`).
  Tách thành `hit_impact` + `player_hurt`.

## Ánh xạ `explosion(vol)` thành 3 file

- Code chỉ có 1 hàm `explosion(vol)` cho mọi vụ nổ. Bộ file tách theo ngữ
  cảnh để nghe phân tầng: `explosion_large` (bomber/căn cứ/người chơi),
  `explosion_small` (fighter/xác rơi), `missile_hit` (tên lửa nổ — ngắn,
  có tiếng kim loại + mảnh vỡ, khác hẳn nổ máy bay). Cách chọn ghi trong
  `audio.md`; quyết định cuối khi tích hợp thuộc chat CODE.

## Nhạc: loop 16 giây, synth hoàn toàn

- Menu: vòng hợp âm Am–F–C–G (pad + pluck thưa). Combat: 120 BPM,
  Dm–B♭–F–C (kick/bass/hat/arp synth), 16 s = đúng 8 ô nhịp để loop khớp.
- Loudness đo 2 pass bằng ffmpeg loudnorm trên master WAV rồi mới encode:
  menu −16,00 LUFS, combat −15,98 LUFS (mục tiêu −16 ± 0,5).
- Kỹ thuật loop không click: lượng tử hoá tần số dao động về số nguyên chu
  kỳ trong độ dài loop + noise tuần hoàn (FFT) + lọc ở trạng thái tuần hoàn
  + crossfade hợp âm vòng tròn; riêng warning/low-health nối tại điểm im
  lặng. Đã đo seam cho cả 5 loop (xem `audio.md`).

## Chuẩn hoá âm lượng

- File là "master đã chuẩn hoá peak" (SFX peak −2…−3,5 dBFS, TP sau encode
  ≤ −1,1 dB); cân bằng nghe cuối nằm ở cột "Âm lượng gợi ý" trong `audio.md`
  (bám theo vol của `audio.js` cũ). Lý do: giữ file sạch, không vỡ, và để
  CODE chỉnh cân bằng bằng 1 số gain thay vì sửa file.
- File < 0,4 s không có số LUFS integrated (chuẩn BS.1770 gating) — dùng
  true peak + RMS khi synth để kiểm soát.

## Định dạng & dung lượng

- OGG Vorbis q3–q5 / MP3 96–160 kbps tùy loại; SFX mono (trừ nổ + động cơ +
  nhạc stereo). Tổng 42 file = 1,53 MiB, dưới xa giới hạn 5 MB nên không cần
  nén thêm làm giảm chất lượng.
- Script synth + script kiểm chứng giữ ngoài repo
  (`~/workspace/audio_synth/`) vì phạm vi việc chỉ cho ghi
  `public/assets/audio/` và `docs/art/`; thông số tái tạo nằm trong
  `audio.md`.
