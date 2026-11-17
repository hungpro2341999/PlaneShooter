# 0003 — Camera bám đuôi — Spec
- Camera ở sau và trên máy bay, bám có độ trễ nhẹ (mượt, không khóa cứng).
- Nhìn về điểm phía trước máy bay (look-ahead).
- Không xuyên địa hình: vị trí camera luôn >= heightAt + minHeightAboveGround.
- Thông số trong `config/balance.ts` mục `camera` (distance, height, damping, lookAhead, fov).
