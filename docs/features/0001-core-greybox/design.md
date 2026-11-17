# 0001 — Design
- Game sở hữu renderer/scene/camera/vòng lặp; feature đăng ký qua `register()`, update theo thứ tự đăng ký.
- World dựng hình từ cùng tham số đảo trong balance.ts và đăng ký `heightAt` phân tích khớp hình (D-003).
- Máy bay tạm: Group gồm cylinder (thân), cone (mũi -Z), box (cánh/đuôi), sphere (kính), cánh quạt tên `propeller`.
- HUD là DOM, nhận số liệu qua EventBus để core không phụ thuộc giao diện.
