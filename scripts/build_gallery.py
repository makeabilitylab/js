import os
from pathlib import Path

apps_dir = Path("src/apps")
print(f"CWD: {os.getcwd()}, apps exists: {apps_dir.exists()}, files: {list(apps_dir.rglob('index.html'))}")
entries = []

for index_file in sorted(apps_dir.rglob("index.html")):
    app_path = index_file.parent
    # e.g. "apps/makelogo/MakeabilityLabLogo"
    rel_path = str(app_path).replace("\\", "/")
    name = app_path.name  # e.g. "MakeabilityLabLogo"
    category = app_path.parent.name  # e.g. "makelogo"
    entries.append((category, name, rel_path))

# Group by category
from collections import defaultdict
by_category = defaultdict(list)
for category, name, path in entries:
    by_category[category].append((name, path))

# Build HTML (customize styling as you like)
sections = ""
for category in sorted(by_category):
    cards = ""
    for name, path in by_category[category]:
        cards += f"""
        <a class="card" href="{path}/">
          <div class="card-name">{name}</div>
          <div class="card-category">{category}</div>
        </a>"""
    sections += f"<section><h2>{category}</h2><div class='grid'>{cards}</div></section>\n"

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Makeability Lab — JavaScript Demo Gallery</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 960px; margin: 0 auto; padding: 2rem; }}
    h1 {{ font-size: 1.8rem; margin-bottom: 0.25rem; }}
    h2 {{ font-size: 1.1rem; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin: 1rem 0 2rem; }}
    .card {{ display: block; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: inherit; transition: box-shadow 0.15s; }}
    .card:hover {{ box-shadow: 0 2px 8px rgba(0,0,0,0.15); }}
    .card-name {{ font-weight: 600; font-size: 0.95rem; }}
    .card-category {{ font-size: 0.75rem; color: #888; margin-top: 0.25rem; }}
  </style>
</head>
<body>
  <h1>Makeability Lab — JavaScript Demo Gallery</h1>
  {sections}
</body>
</html>"""

with open("index.html", "w") as f:
    f.write(html)

print(f"Generated gallery with {len(entries)} apps.")