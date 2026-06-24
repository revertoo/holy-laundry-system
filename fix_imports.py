import os
import re

dir_path = r'c:\Project\holy-laundry-system\frontend\src'
api_url_decl = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    
    # Check if API_URL is inside an import block
    # A simple way to fix: find all lines, if we see the API_URL_decl, remove it.
    # Then find the very last line that has an import statement (either starting with import or ending with ';')
    # Actually, let's just find the first line that starts with 'export default' or 'const ' (other than API_URL) and insert it there.
    
    new_lines = []
    has_decl = False
    for line in lines:
        if line.strip() == api_url_decl:
            has_decl = True
            continue # Remove it from its current bad place
        new_lines.append(line)
        
    if has_decl:
        # Now find a good place to insert it
        insert_idx = -1
        # find the last line that belongs to imports. Usually imports are at the top.
        # We can find the first empty line after all imports, or the first line that defines a component or constant
        for i, line in enumerate(new_lines):
            if line.startswith('export ') or (line.startswith('const ') and not line.startswith('const API_URL')):
                insert_idx = i
                break
        
        if insert_idx != -1:
            # insert an empty line and then the API_URL
            new_lines.insert(insert_idx, '')
            new_lines.insert(insert_idx, api_url_decl)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print('Fixed:', filepath)

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            fix_file(filepath)
