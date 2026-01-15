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
    # Get the plugin root directory (ai-eng-system project root)
    # Hook file is at: plugins/ai-eng-system/hooks/session-start.py
    # Project root is 3 levels up from hooks directory
    hook_dir = Path(__file__).parent
    project_root = hook_dir.parent.parent.parent
    package_json_path = project_root / "package.json"
    
    try:
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
            return package_data.get('version', 'unknown')
    except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
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