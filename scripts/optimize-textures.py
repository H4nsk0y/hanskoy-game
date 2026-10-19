"""Create small runtime copies; never modify the source PNGs. Requires Pillow."""
from pathlib import Path
from PIL import Image
import re
ROOT=Path(__file__).resolve().parents[1]
assets=ROOT/'prototype/assets'
s=(ROOT/'prototype/models.js').read_text(encoding='utf-8')
names=re.findall("'([^']+)'",re.search(r'const names=\[(.*?)\]',s).group(1))
files={n+'.png':512 for n in names}
files.update({'ведьма_атлас.png':1024,'Фон_лес.png':1536,'озеро.png':1024,'огонь.png':1024,'mary-items-atlas.png':512})
before=after=0
for name,size in files.items():
 src=assets/name
 if not src.exists(): continue
 dst=src.with_suffix('.webp')
 with Image.open(src) as image:
  image=image.convert('RGBA')
  if name in [n+'.png' for n in names]:image=image.resize((512,512),Image.Resampling.LANCZOS)
  else:image.thumbnail((size,size),Image.Resampling.LANCZOS)
  image.save(dst,'WEBP',quality=85,method=6)
 before+=src.stat().st_size;after+=dst.stat().st_size
print(f'Texture copies: {before/1048576:.2f} MiB -> {after/1048576:.2f} MiB ({(1-after/before)*100:.1f}% smaller)')
