# 0005 — Design
- Candidate = địch còn sống có góc lệch so với hướng mũi nhỏ nhất trong lockRange; nón giữ khóa rộng hơn nón bắt khóa.
- Lock progress tích lũy theo giây, hao dần khi mất mục tiêu (lockDecayRate); phát `missile:lock` cho HUD + AI né.
- Tên lửa: steering bằng quaternion slerp từng frame về phía mục tiêu; nổ theo proximity -> `combat:damage`.
