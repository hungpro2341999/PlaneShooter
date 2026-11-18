# Âm thanh demo "Văn phòng game dev AI" — pixel art 16-bit

7 âm ấm, retro nhẹ, sạch và không chói — nghe lặp lâu không mệt. Mỗi âm có **OGG + MP3**, 44 100 Hz, tổng **1,26 MB**. Âm lượng đã chuẩn hoá nhẹ tay (peak −4…−9 dB tuỳ vai trò); cột "Gain gợi ý" là mức phát đề xuất trong trang demo.

| File | Dùng khi | Dài | Loop | Gain gợi ý | Nguồn | Giấy phép |
|---|---|---|---|---|---|---|
| `office_ambience_loop` | Nền văn phòng buổi tối, phát liên tục | 45,0 s | **Có** (crossfade 2 s, không click) | 0,35 | "Empty Office Ambience" — **simonjeffery13** (Freesound #750799), lấy đoạn ổn định nhất | **CC0** |
| `typing_loop` | Robot đang gõ code | 6,0 s | **Có** (crossfade 0,4 s) | 0,30 | "Keyboard Typing 10 (WhiteFox, Mechanical)" — **grcekh** (Freesound #546167), đoạn gõ đều nhất | **CC0** |
| `task_send` | Trưởng phòng giao việc (giấy bay vút) | 0,38 s | Không | 0,60 | Tự tổng hợp (noise qua band-pass quét tần, mô phỏng giấy lướt) | CC0 (của dự án) |
| `task_done` | Robot báo xong việc — chuông ấm 3 nốt Do–Mi–Sol | 0,70 s | Không | 0,65 | Tự tổng hợp (chuông sine + hài âm, decay mềm) | CC0 (của dự án) |
| `review_pass` | Duyệt đạt — "ding-ding" đi lên | 0,40 s | Không | 0,60 | Tự tổng hợp (2 chuông sine La–Mi) | CC0 (của dự án) |
| `blocked_alert` | Bị chặn — cảnh báo trầm, nhẹ (2 nốt hạ, low-pass, không buzz chói) | 0,45 s | Không | 0,55 | Tự tổng hợp | CC0 (của dự án) |
| `deploy_fanfare` | Đưa game lên web — fanfare chiến thắng 2,6 s (arpeggio Do–Mi–Sol–Do + hợp âm kết, sóng tam giác ấm) | 2,60 s | Không | 0,70 | Tự tổng hợp | CC0 (của dự án) |

## Ghi chú nguồn

- 2 âm nền/loop là **tiếng thu thật** từ Freesound (chỉ lấy CC0/CC-BY, đã kiểm trang gốc). Một số file preview trên Freesound CDN trả 403 khi tải ngoài trình duyệt (send/done/pass/blocked/fanfare dạng file ngắn), nên 5 âm ngắn được **tự tổng hợp** theo đúng chất retro ấm — phương án này nằm trong yêu cầu ("hoặc tự tổng hợp nếu phù hợp chất retro"). Nếu sau này muốn thay bằng bản thu thật, ứng viên đã lọc sẵn: PaperSlide — eyesonlegs (Freesound #464302, CC0); Warm Success Notification — zenosounds (#878437, CC-BY); Soft Notifications Bell — LegitCheese (#571513, CC0); Win Jingle / Quest Complete — Qvantor (#878605/#878610, CC0).
- Không dùng nguồn NC/ND nào. Âm tự tổng hợp phát hành CC0, không cần ghi công.
- Kiểm chứng: ffprobe đúng 44 100 Hz cả 14 file; điểm nối 2 loop đã đo bước nhảy mẫu — nằm trong dốc tự nhiên của tín hiệu, không click. Chưa nghe bằng tai người trong trình duyệt thật.
