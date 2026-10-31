# Материалы второй главы

## Дополнение: четыре горизонта

Новый файл: `assets/chapter2-horizons.webp` (около 201 КиБ). Режим: встроенный `image_gen`, новая генерация, затем конвертация PNG в WEBP без изменения рисунка. Атлас содержит четыре горизонтальные панорамы; `chapter-two-atmosphere.js` выбирает полосу для текущей области. Отдельные варианты для тракта, города, трактира и поместья. У цилиндра плавные прозрачные края, собственный порядок отрисовки и загрузка только при посещении второй главы.

Промпт:

```text
Production environment background atlas for a 1998-2003 low polygon gothic dark fantasy first person RPG. Wide image split into FOUR equally sized HORIZONTAL PANORAMIC STRIPS stacked vertically, exactly four rows, no borders no labels no text. Each strip is an atmospheric distant environment panorama, flat perspective suitable wrapped on a cylindrical distant background, mostly silhouettes and textured old CGI mist, NOT a foreground playable scene. No people, no pyramids, no geometric mountains, no interface. Top strip: Royal Road, dense dark leafy twisted forest silhouette, indigo sky, turquoise low fog, distant rounded wooded hills. Second strip: border city Valden, jagged gothic rooftops and spires far away, muted blue night sky, patches warm windows, dark low horizon. Third strip: roadside inn, deep evergreen forest horizon, low marsh mist teal, huge pale clouds, abandoned windmill silhouette very small and distant. Fourth strip: vampire manor, violet storm clouds, distant ancient castle with thin spires, black forest hills, subtle crimson fog near ground. Cohesive saturated cold blues/turquoise, high contrast, retro CGI texture, slightly glossy old game aesthetic. Each row has sky in upper half and dark distant landscape in lower half, left and right edges closely match in brightness for wrapping. No modern photorealism, no anime, no painterly brushstrokes.
```

Режим: встроенный `image_gen`, новая генерация. Сгенерирован единый атлас материалов для объёмных моделей. В проекте: `assets/chapter2-atlas.webp` (около 574 КиБ). Исходник PNG сохранён в каталоге Codex generated_images. WEBP получен конвертацией формата без изменения рисунка.

Атлас разбивается на 16 квадратов в `chapter-two-models.js`. Текстуры кожи, ткани, кожи одежды и кольчуги накладываются на реальные 3D-меши жителей, стражи, культистов и вампира. Материалы дерева, камня и кровли используются в новой архитектуре. Повторяющиеся поверхности получают отдельные тайлы без захвата соседней ячейки. Атлас загружается при первом посещении новой локации.

Сетка 4×4, слева направо:

1. Кожа человека; старая бледная кожа; тёмная кожа одежды; синяя ткань с золотом.
2. Бордовая шерсть; охристый лён; серо-зелёный лён; тёмная ткань культа.
3. Кольчуга; кость; фиолетовый бархат; пергамент.
4. Дубовые доски; серо-синий камень; черепица; мшистая скала.

## Промпт

```text
Use case: stylized-concept. Asset type: production texture atlas for an existing low-poly first-person retro gothic dark fantasy RPG, 1998-2003 3D game / old CGI aesthetics. Create a perfectly square 4 by 4 grid of exactly 16 equally sized edge-to-edge square material swatches, no borders, no gutters, no text, no objects, no perspective. Each cell must be a flat orthographic hand-painted game texture to be mapped onto actual 3D meshes, subtle readable detail, no lighting baked strongly, no painted body shapes or character silhouettes. Row 1 left to right: warm rough human skin with pores; weathered pale older skin; dark brown leather with stitching; royal desaturated navy cloth with gold embroidery. Row 2: burgundy wool with fine weave; ochre brown linen; dirty sage green linen; charcoal cultist robe cloth with muted red stitching. Row 3: worn steel chainmail small rings; pale bone ivory mottling; dark violet vampire velvet brocade; sun-faded parchment with faint illegible distressed marks, no legible text. Row 4: rough oak planks; grey blue dressed stone; warm terracotta roof shingles; greenish black mossy cliff stone. Rich restrained cold blues / turquoise / muted warm clothing colors, high contrast yet usable diffuse maps, slight retro glossy game texture feel. Exactly one cohesive clean atlas. No environment illustration, no people, no interface, no checkerboard, no margin.
```
