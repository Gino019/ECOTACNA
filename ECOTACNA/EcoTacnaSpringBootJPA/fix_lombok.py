import os
import re

def add_getters_setters(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "// Getters and Setters" in content:
        return # already added
        
    fields = re.findall(r'private\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*(?:=|;)', content)
    
    methods = "\n    // Getters and Setters\n"
    for type_name, var_name in fields:
        capitalized = var_name[0].upper() + var_name[1:]
        # Getter
        if type_name.lower() == 'boolean':
            methods += f"    public {type_name} is{capitalized}() {{ return {var_name}; }}\n"
        else:
            methods += f"    public {type_name} get{capitalized}() {{ return {var_name}; }}\n"
        # Setter
        methods += f"    public void set{capitalized}({type_name} {var_name}) {{ this.{var_name} = {var_name}; }}\n"
        
    if "public static class" not in content and "Builder" not in content:
        content = content.replace("}\n", methods + "}\n")
    else:
        # insert before the last brace of the outer class
        lines = content.split('\n')
        for i in range(len(lines)-1, -1, -1):
            if lines[i].strip() == '}':
                lines.insert(i, methods)
                break
        content = '\n'.join(lines)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"c:\Users\MILTONHFLORESCHINO\Downloads\ECOTACNA (2)\ECOTACNA (2)\ECOTACNA\EcoTacnaSpringBootJPA\src\main\java\com\GAKOM_ECOTACNA\ECOTACNA"
files_to_fix = [
    os.path.join(base_dir, "model", "User.java"),
    os.path.join(base_dir, "dto", "RegisterRequest.java"),
    os.path.join(base_dir, "dto", "LoginRequest.java"),
    os.path.join(base_dir, "dto", "AuthResponse.java")
]

for f in files_to_fix:
    add_getters_setters(f)
    print(f"Fixed {f}")
