# 0004 — Design
- Dùng `core/Projectiles.ts` (ProjectileSystem dùng chung với AI địch): đạn là box sáng kéo dài,
  trúng = kiểm khoảng cách tới registry mỗi frame, báo qua event `combat:damage`.
- Heat là state riêng của feature; phát `gun:state` 10Hz cho HUD. Súng chỉ bắn khi player còn sống.
