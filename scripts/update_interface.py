import os
import re

en_file = 'src/lib/i18n/locales/en.ts'
with open(en_file, 'r', encoding='utf-8') as f:
    en_content = f.read()

# Extract the object body
match = re.search(r'export const en: Translations = \{([\s\S]+)\};', en_content)
if not match:
    print("Could not find en object")
    exit(1)

body = match.group(1)

# Extract sections
sections = {}
section_pattern = re.compile(r'^\s*(\w+):\s*\{([^}]*)\}', re.MULTILINE)
for m in section_pattern.finditer(body):
    section_name = m.group(1)
    section_body = m.group(2)
    keys = []
    # Find all keys
    # Keys can be word: 'value'
    key_pattern = re.compile(r'^\s*(\w+):', re.MULTILINE)
    for km in key_pattern.finditer(section_body):
        keys.append(km.group(1))
    
    # Also find keys that might be inline: key: 'val', key2: 'val'
    key_pattern2 = re.compile(r'\b(\w+)\s*:')
    for line in section_body.split('\n'):
        line = line.strip()
        if not line or line.startswith('//'): continue
        # To avoid matching inside strings, we can just split by , 
        # But a simple regex should be fine since strings don't have unquoted keys
        # Wait, the inline regex is better:
        pass
        
    sections[section_name] = []

# Better approach to extract keys:
# Since en.ts is well formatted, let's just parse it manually
sections = {}
current_section = None
for line in body.split('\n'):
    line = line.strip()
    if not line or line.startswith('//'): continue
    
    section_match = re.match(r'^(\w+):\s*\{', line)
    if section_match:
        current_section = section_match.group(1)
        sections[current_section] = []
        continue
    
    if line == '},' or line == '}':
        current_section = None
        continue
        
    if current_section:
        # line might have multiple key: 'val', pairs
        # e.g. profile: 'Profile', farmerName: 'Farmer Name',
        # we can use regex to find all unquoted words followed by :
        keys = re.findall(r'\b([a-zA-Z0-9_]+)\s*:', line)
        for k in keys:
            if k not in sections[current_section] and k not in ['http', 'https']:
                sections[current_section].append(k)

# Now read translations.ts
trans_file = 'src/lib/i18n/translations.ts'
with open(trans_file, 'r', encoding='utf-8') as f:
    trans_content = f.read()

# Replace the interface
interface_lines = []
interface_lines.append('export interface Translations {')
for sec, keys in sections.items():
    interface_lines.append(f'  {sec}: {{')
    for k in keys:
        interface_lines.append(f'    {k}: string;')
    interface_lines.append('  };')
interface_lines.append('}')

interface_str = '\n'.join(interface_lines)

# Find where to replace
new_trans_content = re.sub(r'export interface Translations \{[\s\S]+?\n\}', interface_str, trans_content)

with open(trans_file, 'w', encoding='utf-8') as f:
    f.write(new_trans_content)

print("Generated interface in translations.ts")
