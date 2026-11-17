# 0008 — Design
- Waves phát `enemy:spawn` đầu mỗi đợt; theo dõi địch còn sống qua AircraftRegistry.
- Hết đợt -> nghỉ betweenWavesDelay -> đợt kế; hết đợt 3 -> thắng. Player destroyed (event) -> thua ngay.
- Phát `wave:state` 5Hz cho HUD và `game:over {win, reason}` một lần duy nhất. Chơi lại = reload trang (D-011).
