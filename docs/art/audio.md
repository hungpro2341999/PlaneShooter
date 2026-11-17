# PlaneShooter — Bộ âm thanh (nhánh `asset/audio`)

Bộ file âm thanh hoàn chỉnh cho bản game hiện tại trên `main` (bản bash.tv:
`src/audio.js` + `src/main.js`). **Chưa gắn vào game, không sửa code** — đây là
asset độc lập để chat CODE tích hợp sau (xem mục "Cách gắn vào audio.js").

Nghe thử tất cả: mở `docs/art/audio-preview.html` (bấm play từng file).

## Nguồn gốc & giấy phép

- **Tự tổng hợp 100% bằng code** (Python + numpy/scipy, encode bằng ffmpeg):
  không dùng sample ngoài, không nhạc có sẵn → **phát hành CC0 1.0**, ghi công
  không bắt buộc. Script sinh: `make_audio.py` (lưu ngoài repo, chạy 2 pass:
  synth → đo loudnorm → chỉnh gain nhạc về −16 LUFS → encode).
- Âm sắc bám sát công thức procedural đang có trong `src/audio.js` (cùng tần
  số, cùng sweep, cùng nhịp bíp) để khi thay file vào, game nghe "đúng chất"
  như bản Web Audio hiện tại nhưng giàu và rõ hơn.

## Thông số chung (đã kiểm chứng bằng ffprobe + ffmpeg loudnorm)

| Tiêu chí | Kết quả |
|---|---|
| Định dạng | Mỗi âm có **OGG (Vorbis)** + **MP3** dự phòng |
| Sample rate | **44 100 Hz** tất cả 42 file |
| Nhạc | **−16,0 LUFS** (menu) / **−16,0 LUFS** (combat), true peak ≤ −2,4 dB |
| SFX | True peak ≤ **−1,1 dB** (không vỡ tiếng sau encode) |
| Khoảng lặng đầu file | ≤ 4 ms (synth bắt đầu ngay, không cần trim thêm) |
| Độ dài SFX | Tất cả < 2 s, trừ `explosion_large` 2,80 s (ngoại lệ được phép) |
| Loop | 5 file loop liền mạch, đã đo seam: bước nhảy tại điểm nối nằm trong biên độ dốc tự nhiên của tín hiệu (không click) — xem mục Kiểm chứng |
| **Tổng dung lượng** | **42 file = 1 599 353 byte ≈ 1,53 MiB** (giới hạn 5 MB) |

## Bảng âm thanh → sự kiện trong game

"Âm lượng gợi ý" là gain khi phát (0–1) với master giữ như hiện tại; các file
đã được chuẩn hoá peak đồng đều nên gain này chính là cân bằng nghe cuối.
Cột "Hàm hiện tại" là method trong `src/audio.js` / điểm gọi trong
`src/main.js` (main `b0ddd69`) mà file này thay thế hoặc bổ sung.

| File (`.ogg` + `.mp3`) | Sự kiện trong game | Hàm / điểm gọi hiện tại | Dài | Kênh | LUFS-I / TP (dB) | Âm lượng gợi ý | Loop | Nguồn / giấy phép |
|---|---|---|---|---|---|---|---|---|---|
| `engine_loop` | Động cơ khi đang bay; cao độ + độ lớn theo ga | `Sfx.engine(throttle, boost, active)`, gọi mỗi frame lúc `play` | 4,00 s | stereo | −7,5 / −1,6 | 0,30, tăng theo ga (xem dưới) | **Có** | Synth code, CC0 |
| `boost` | Kích hoạt boost (Shift) | `Sfx.boost()` khi `boostEdge` | 0,90 s | mono | −13,8 / −1,5 | 0,70 | Không | Synth code, CC0 |
| `gun` | Súng máy người chơi — **mỗi phát bắn** | `Sfx.gun()` trong `fireGun()` | 0,10 s | mono | —* / −1,6 | 0,55 / phát | Không | Synth code, CC0 |
| `enemy_gun` | Súng máy địch (mờ dần theo khoảng cách < 700) | `Sfx.enemyGun(vol)` | 0,09 s | mono | —* / −3,1 | 0,40 × hệ số khoảng cách | Không | Synth code, CC0 |
| `overheat` | Súng quá nhiệt (`heat >= 1`) | `Sfx.overheat()` | 0,70 s | mono | −17,6 / −1,1 | 0,60 | Không | Synth code, CC0 |
| `missile_launch` | Phóng tên lửa (người chơi **và** địch) | `Sfx.missile()` tại 2 điểm gọi | 1,20 s | mono | −12,7 / −1,5 | 0,80 | Không | Synth code, CC0 |
| `missile_hit` | Tên lửa phát nổ khi trúng đích / hết tầm | Hiện dùng chung `Sfx.explosion(vol)` khi tên lửa nổ | 0,80 s | mono | −19,7 / −2,2 | 0,85 × hệ số khoảng cách | Không | Synth code, CC0 |
| `explosion_large` | Nổ lớn: hạ oanh tạc cơ, căn cứ trúng đòn nặng, người chơi bị hạ | `Sfx.explosion(1)` / `explosion(vol)` cho bomber + base + player | 2,80 s | stereo | −16,9 / −1,5 | 1,00 × hệ số khoảng cách | Không | Synth code, CC0 |
| `explosion_small` | Nổ nhỏ: hạ tiêm kích, xác máy bay chạm đất/nước | `Sfx.explosion(vol)` cho fighter + wreck | 1,10 s | stereo | −18,0 / −1,9 | 0,80 × hệ số khoảng cách | Không | Synth code, CC0 |
| `hit_impact` | Đạn người chơi trúng địch (kèm hit marker) | `Sfx.hit()`, gọi với xác suất 0,4 như code hiện tại | 0,08 s | mono | —* / −1,5 | 0,35 | Không | Synth code, CC0 |
| `player_hurt` | Người chơi trúng đạn địch | `Sfx.hurt()` trong `damagePlayer()` | 0,28 s | mono | —* / −1,7 | 0,80 | Không | Synth code, CC0 |
| `lock_beep_locking` | Bíp nhịp trong lúc đang khóa (mỗi nấc 20% tiến độ) | `Sfx.lockTick()` khi `lock.p` tăng qua nấc | 0,06 s | mono | —* / −2,6 | 0,30 | Không | Synth code, CC0 |
| `lock_beep_locked` | Bíp dài khi khóa xong (`lock.p >= 1`) | `Sfx.locked()` | 0,50 s | mono | −3,9 / −2,7 | 0,35 | Không | Synth code, CC0 |
| `missile_lock_warning` | Còi **MISSILE LOCK**: tên lửa địch đang bám theo người chơi | `Sfx.warning(mode=2)` — bíp nhanh 0,16 s/lần trong audio.js | 1,28 s | mono | −7,4 / −1,3 | 0,40 | **Có** | Synth code, CC0 |
| `low_health` | **MỚI** — cảnh báo máu thấp (đề xuất: HP ≤ 30%) | Chưa có trong code; đề xuất điểm gắn ở mục dưới | 1,60 s | mono | −17,0 / −2,5 | 0,50 | **Có** | Synth code, CC0 |
| `wave_start` | Bắt đầu đợt địch mới (banner "ĐỢT n") | `Sfx.wave()` trong `startWave()` | 0,60 s | mono | −10,5 / −2,5 | 0,70 | Không | Synth code, CC0 |
| `win` | **MỚI** — thắng trận (màn hình kết quả CHIẾN THẮNG) | Chưa có; đề xuất gọi trong `endGame(true)` | 1,90 s | mono | −15,5 / −2,1 | 0,80 | Không | Synth code, CC0 |
| `lose` | **MỚI** — thua trận (bị bắn hạ / mất căn cứ / hết giờ) | Chưa có; đề xuất gọi trong `endGame(false)` | 1,90 s | mono | −14,8 / −2,0 | 0,80 | Không | Synth code, CC0 |
| `ui_click` | Bấm mọi nút UI (Start, Hướng dẫn, Tiếp tục…) | `Sfx.ui()` qua helper `click()` | 0,07 s | mono | —* / −2,9 | 0,50 | Không | Synth code, CC0 |
| `music_menu` | **MỚI** — nhạc nền menu / hướng dẫn / kết quả | Chưa có nhạc trong code | 16,00 s | stereo | **−16,0** / −7,7 | 0,50 | **Có** | Synth code, CC0 |
| `music_combat` | **MỚI** — nhạc nền khi đang chiến đấu | Chưa có nhạc trong code | 16,00 s | stereo | **−16,0** / −2,4 | 0,55 | **Có** | Synth code, CC0 |

\* File ngắn hơn ~0,4 s nên bộ đo LUFS theo chuẩn BS.1770 không cho số
integrated (gating) — mức nghe được kiểm soát bằng true peak và RMS khi synth.

### Ghi chú theo âm

- **Động cơ đổi cao độ theo ga:** `engine_loop` thu ở ga giữa. Khi gắn vào,
  đặt `playbackRate = 0.82 + throttle × 0.5 + (boost ? 0.22 : 0)` và
  `gain = 0.18 + throttle × 0.22 + (boost ? 0.10 : 0)` — tương đương dải tần
  55–165 Hz mà `Sfx.engine()` đang quét. Loop 4 s dựng từ dao động nguyên chu
  kỳ + noise tuần hoàn nên đổi rate không phá điểm nối.
- **Súng máy phát nhanh liên tục:** `gun` là 1 phát 0,10 s. Code hiện gọi
  `sfx.gun()` theo từng phát (nhịp bắn của game) — giữ nguyên cách gọi đó,
  mỗi lần phát tạo 1 voice mới (chồng tiếng được). Không loop file này.
- **Cảnh báo bị khóa 2 mức:** mức 1 "đang bị bám" (`warning(mode=1)`, bíp
  chậm 0,6 s) → phát `lock_beep_locking` theo nhịp 0,6 s; mức 2 "tên lửa
  đang lao tới" (`mode=2`) → loop `missile_lock_warning`.
- **Nhạc:** menu = pad Am–F–C–G êm, 16 s; combat = 120 BPM, Dm–B♭–F–C, có
  kick/bass/hat synth, 16 s = đúng 8 ô nhịp nên loop khớp nhịp.

## Cách gắn vào `audio.js` sau này (cho chat CODE — chưa áp dụng)

Giữ nguyên class `Sfx` làm fallback, thêm lớp phát file bên cạnh:

```js
// 1) Bảng file (OGG trước, MP3 dự phòng — trình duyệt tự chọn qua canPlayType)
const FILES = {
  engine: 'engine_loop', boost: 'boost', gun: 'gun', enemyGun: 'enemy_gun',
  overheat: 'overheat', missile: 'missile_launch', missileHit: 'missile_hit',
  explosionL: 'explosion_large', explosionS: 'explosion_small',
  hit: 'hit_impact', hurt: 'player_hurt', lockTick: 'lock_beep_locking',
  locked: 'lock_beep_locked', warning: 'missile_lock_warning',
  lowHealth: 'low_health', wave: 'wave_start', win: 'win', lose: 'lose',
  ui: 'ui_click', musicMenu: 'music_menu', musicCombat: 'music_combat',
};
const BASE = 'assets/audio/'; // public/assets/audio -> served at /assets/audio/

// 2) Nạp trước bằng Web Audio (decode 1 lần, phát nhiều voice chồng nhau được)
async function loadBank(ctx) {
  const ext = new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  const bank = {};
  await Promise.all(Object.entries(FILES).map(async ([k, name]) => {
    const buf = await (await fetch(`${BASE}${name}.${ext}`)).arrayBuffer();
    bank[k] = await ctx.decodeAudioData(buf);
  }));
  return bank;
}

// 3) Phát 1 shot: play(bank.gun, { vol: 0.55 }) — tạo BufferSource + Gain mỗi lần.
//    Loop (engine / warning / lowHealth / music): giữ 1 BufferSource loop=true,
//    start/stop theo trạng thái; engine chỉnh playbackRate + gain mỗi frame
//    thay cho Sfx.engine() hiện tại.
//    Nhạc: crossfade gain 1.5 s khi đổi state menu <-> play.
```

Ánh xạ thay thế 1-1 với method cũ: `gun→gun()`, `enemyGun→enemyGun()`,
`missile→missile()`, `lockTick→lockTick()`, `locked→locked()`, `ui→ui()`,
`overheat→overheat()`, `wave→wave()`, `boost→boost()`, `hit→hit()`,
`hurt→hurt()`, `explosion(vol)` → chọn `explosion_large` (bomber/base/player)
hoặc `explosion_small` (fighter/wreck) theo `vol`/loại mục tiêu, riêng tên lửa
nổ dùng `missile_hit`. Ba âm **mới** cần thêm điểm gọi: `low_health` (bật loop
khi `player.hp <= 0.3 × playerHp`, tắt khi hồi trên ngưỡng), `win`/`lose`
trong `endGame(win)`, nhạc trong vòng đổi state (`toMenu/startGame/showResult`).

## Kiểm chứng đã làm

- ffprobe từng file: đúng 44 100 Hz, đúng số kênh, decode không lỗi (cả 42).
- Loudness: nhạc đo lại sau encode = −16,00 / −15,98 LUFS; mọi SFX true peak
  ≤ −1,1 dB (đợt đầu có 2 file TP −0,3/−0,4 sau encode → đã hạ peak master
  và encode lại).
- Loop: đo bước nhảy mẫu tại điểm nối so với các bước kề ±100 ms cho cả 5
  file loop — điểm nối nằm trong dốc tự nhiên của tín hiệu, không click;
  `missile_lock_warning` và `low_health` nối tại điểm im lặng (jump = 0).
- Trang nghe thử `audio-preview.html` dùng đúng file thật trong
  `public/assets/audio/`.

## Chưa làm được / giới hạn

- Chưa nghe bằng tai người trong trình duyệt thật — kiểm chứng bằng số đo
  (loudness, peak, seam, phổ) và trang preview để user nghe duyệt.
- Chưa gắn vào game (đúng phạm vi việc): `src/audio.js` vẫn là bản procedural.
- LUFS của các file < 0,4 s không đo được theo BS.1770 (giới hạn của chuẩn đo,
  không phải lỗi file).
