#!/usr/bin/env python3
"""
Session start hook for ai-eng-system plugin.
Reads package.json version and displays loading message.
"""

import json
import os
import sys
from pathlib import Path

def get_package_version():
    """Read version from package.json"""
    # Try both direct file path and environment variable
    if '__file__' in globals():
        # When run directly: __file__ is available
        hook_file = Path(__file__).resolve()
        print(f"DEBUG: Running directly, hook_file={hook_file}")
    else:
        # When run via shell: use script path
        script_path = os.path.abspath(sys.argv[0]) if sys.argv else None
        hook_file = Path(script_path).resolve() if script_path else Path.cwd()
        print(f"DEBUG: Running via shell, script_path={script_path}, hook_file={hook_file}")
    
    # Hook file is usually in .claude/hooks/ or plugins/ai-eng-system/hooks/
    # Project root is typically 2 levels up from hooks directory
    # But if we're in .claude/hooks/, project root is 2 levels up
    # If we're in plugins/ai-eng-system/hooks/, project root is 3 levels up
    if hook_file.parent.name == '.claude':
        project_root = hook_file.parent.parent
    else:
        project_root = hook_file.parent.parent.parent
    package_json_path = project_root / "package.json"
    print(f"DEBUG: project_root={project_root}, package_json_path={package_json_path}")
    
    try:
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
            version = package_data.get('version', 'unknown')
            print(f"DEBUG: Read version={version} from package.json")
            return version
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
        print(f"DEBUG: Exception reading package.json: {e}")
        return "unknown"

def main():
    """Main hook function"""
    version = get_package_version()
    
    # Use ANSI colors for better visibility
    green = '\033[92m'
    blue = '\033[94m'
    reset = '\033[0m'
    bold = '\033[1m'
    
    print(f"{green}{bold}✓{reset} {blue}ai-eng-system v{version}{reset} {green}loaded{reset}")

if __name__ == "__main__":
    main()
