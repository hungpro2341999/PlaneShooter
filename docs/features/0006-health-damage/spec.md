# 0006 — Máu & sát thương — Spec
- Mọi máy bay (player/tiêm kích/ném bom) có máu trong balance.health.
- Hết máu -> nổ (particle tạm), phát event `aircraft:destroyed`, máy bay biến mất.
- Nghiệm thu: bắn hạ được địch; địch bắn hạ được player; event destroyed tới waves/HUD.
