import os
import re
import shutil

locales_dir = 'src/lib/i18n/locales'
all_languages = ["bengali", "telugu", "marathi", "kannada", "punjabi", "konkani", "kashmiri", "nepali", "sindhi", "santali", "hindi", "gujarati", "urdu", "odia", "malayalam", "assamese", "maithili", "sanskrit", "dogri", "tamil"]
missing = ["bengali", "telugu", "marathi", "kannada", "punjabi", "konkani", "kashmiri", "nepali", "sindhi", "santali"]

# Fix Tamil (which had export default tamil)
tamil_path = os.path.join(locales_dir, 'tamil.ts')
if os.path.exists(tamil_path):
    with open(tamil_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'export default tamil' in content:
        content = content.replace('const tamil: Translations =', 'export const tamil: Translations =')
        content = content.replace('export default tamil;', '')
        with open(tamil_path, 'w', encoding='utf-8') as f:
            f.write(content)

with open(os.path.join(locales_dir, 'en.ts'), 'r', encoding='utf-8') as f:
    en_content = f.read()

# 1. Create missing languages
for m in missing:
    p = os.path.join(locales_dir, f'{m}.ts')
    if not os.path.exists(p):
        content = en_content.replace('export const en:', f'export const {m}:')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(content)

# 2. Extract landing from en.ts
landing_match = re.search(r'(landing:\s*\{[^}]+\},)', en_content)
landing_str = landing_match.group(1) if landing_match else ""

# 3. Patch existing files that don't have landing
for lang in all_languages:
    p = os.path.join(locales_dir, f'{lang}.ts')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'landing:' not in content and landing_str:
            # insert landing after brand
            content = re.sub(r'(brand:\s*\{[^}]+\},)', r'\1\n  ' + landing_str + '\n', content)
            with open(p, 'w', encoding='utf-8') as f:
                f.write(content)

print("Locales patched successfully!")
