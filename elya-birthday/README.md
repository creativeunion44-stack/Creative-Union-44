# Эле 1 годик — праздничное видео

Вертикальное видео 1080×1920, ~64 с: интро с шарами и конфетти, монтаж фото и
видео с подписями, финальное поздравление в стихах. Музыка — «Happy Birthday»
(мелодия в общественном достоянии) в стиле музыкальной шкатулки, синтезирована
скриптом `scripts/make_music.py`.

Фото (`public/photos/p1..p8.jpg`) и клипы (`public/footage/*.mp4`) в Git не
хранятся.

```console
npm ci
pip install numpy
python3 scripts/make_music.py 63.8 public/music.wav
npx remotion render ElyaBirthday out/Elya_1_god.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
