#!/usr/bin/env python3
"""
Pathfinder Discord Bot Manager
A utility script to manage, build and run your TypeScript Discord bot
"""

import os
import subprocess
import sys
import time
import signal
import platform
import shutil

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Get the appropriate npm command for the system
def get_npm_command():
    # Try standard npm command first
    try:
        subprocess.run(['npm', '--version'], 
                      capture_output=True, 
                      check=False)
        return 'npm'
    except FileNotFoundError:
        # On Windows, try with full path options
        if platform.system() == 'Windows':
            possible_paths = [
                r'C:\Program Files\nodejs\npm.cmd',
                r'C:\Program Files (x86)\nodejs\npm.cmd',
                os.path.expanduser('~\\AppData\\Roaming\\npm\\npm.cmd')
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    return path
                    
            # Try npm.cmd instead of npm
            try:
                subprocess.run(['npm.cmd', '--version'], 
                              capture_output=True, 
                              check=False)
                return 'npm.cmd'
            except FileNotFoundError:
                pass
                
    # If we get here, npm command not found
    return None

# Check if .env file exists and is configured
def check_env_file():
    if not os.path.exists('.env'):
        print(f"{Colors.FAIL}Error: .env file not found!{Colors.ENDC}")
        print(f"{Colors.WARNING}Creating a template .env file. Please fill in your Discord token and client ID.{Colors.ENDC}")
        
        with open('.env', 'w') as f:
            f.write("""# Discord Bot Configuration
DISCORD_TOKEN=your_discord_token_here
CLIENT_ID=your_client_id_here
COMMAND_PREFIX=!
DEV_GUILD_ID=your_development_server_id_here  # Optional, for faster slash command updates

# Feature Flags
REGISTER_COMMANDS=true
ENABLE_PLURALKIT=true

# API Endpoints
PLURALKIT_API=https://api.pluralkit.me/v2

# Admin Configuration
OWNER_IDS=your_discord_id_here  # Comma-separated list of Discord user IDs

# Data Settings
DATA_PATH=./data
""")
        
        print(f"{Colors.BLUE}Template .env file created. Please edit it with your Discord token and client ID.{Colors.ENDC}")
        return False
    
    # Check if token and client ID are set in .env file
    with open('.env', 'r') as f:
        env_content = f.read()
    
    if 'your_discord_token_here' in env_content or 'your_client_id_here' in env_content:
        print(f"{Colors.FAIL}Error: You need to set your Discord token and client ID in the .env file!{Colors.ENDC}")
        return False
    
    return True

# Check if package.json exists and is properly configured
def check_package_json():
    if not os.path.exists('package.json'):
        print(f"{Colors.FAIL}Error: package.json not found!{Colors.ENDC}")
        print(f"{Colors.WARNING}Creating a basic package.json file...{Colors.ENDC}")
        
        with open('package.json', 'w') as f:
            f.write("""{
  "name": "the-vixen",
  "version": "1.0.0",
  "description": "A TypeScript Discord bot for Pathfinder 2E with dice rolling and PluralKit integration",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch"
  },
  "keywords": [
    "discord",
    "bot",
    "pathfinder",
    "dice",
    "pluralkit"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "discord.js": "^14.11.0",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "@types/node": "^18.16.3",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.4"
  }
}
""")
        
        print(f"{Colors.GREEN}Basic package.json created.{Colors.ENDC}")
        return True
    return True

# Check if tsconfig.json exists
def check_tsconfig():
    if not os.path.exists('tsconfig.json'):
        print(f"{Colors.FAIL}Error: tsconfig.json not found!{Colors.ENDC}")
        print(f"{Colors.WARNING}Creating a basic tsconfig.json file...{Colors.ENDC}")
        
        with open('tsconfig.json', 'w') as f:
            f.write("""{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "**/*.test.ts"
  ]
}
""")
        
        print(f"{Colors.GREEN}Basic tsconfig.json created.{Colors.ENDC}")
        return True
    return True

# Check for dependencies and install if missing
def check_dependencies():
    npm_cmd = get_npm_command()
    
    if npm_cmd is None:
        print(f"{Colors.FAIL}Error: npm not found. Please install Node.js and npm.{Colors.ENDC}")
        print(f"{Colors.WARNING}Make sure the npm command is in your PATH or run the commands manually:{Colors.ENDC}")
        print(f"  npm install")
        print(f"  npm run build")
        print(f"  npm start")
        return False
    
    print(f"{Colors.BLUE}Using npm command: {npm_cmd}{Colors.ENDC}")
    
    try:
        result = subprocess.run([npm_cmd, 'list', '--depth=0'], 
                                capture_output=True, 
                                text=True, 
                                check=False)
        
        required_packages = ['discord.js', 'dotenv', 'typescript', 'ts-node']
        missing_packages = []
        
        for package in required_packages:
            if package not in result.stdout:
                missing_packages.append(package)
        
        if missing_packages:
            print(f"{Colors.WARNING}Missing required npm packages: {', '.join(missing_packages)}{Colors.ENDC}")
            print(f"{Colors.BLUE}Installing missing packages...{Colors.ENDC}")
            
            # Install missing packages
            subprocess.run([npm_cmd, 'install', *missing_packages], check=True)
            print(f"{Colors.GREEN}Packages installed successfully!{Colors.ENDC}")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"{Colors.FAIL}Error checking dependencies: {e}{Colors.ENDC}")
        return False

# Build TypeScript code
def build_typescript():
    npm_cmd = get_npm_command()
    if npm_cmd is None:
        print(f"{Colors.FAIL}Error: npm not found. Cannot build project.{Colors.ENDC}")
        return False
        
    print(f"{Colors.BLUE}Building TypeScript code...{Colors.ENDC}")
    try:
        result = subprocess.run([npm_cmd, 'run', 'build'], 
                                capture_output=True, 
                                text=True, 
                                check=False)
        
        if result.returncode != 0:
            print(f"{Colors.FAIL}Build failed!{Colors.ENDC}")
            print(f"{Colors.WARNING}Error output:{Colors.ENDC}\n{result.stderr}")
            return False
        
        print(f"{Colors.GREEN}Build successful!{Colors.ENDC}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"{Colors.FAIL}Build failed: {e}{Colors.ENDC}")
        return False

# Run the bot
def run_bot(dev_mode=False):
    npm_cmd = get_npm_command()
    if npm_cmd is None:
        print(f"{Colors.FAIL}Error: npm not found. Cannot run bot.{Colors.ENDC}")
        return
    
    # Kill any existing Node.js processes related to the bot
    kill_existing_processes()
        
    command = [npm_cmd, 'run', 'dev' if dev_mode else 'start']
    
    print(f"{Colors.BLUE}Starting bot in {'development' if dev_mode else 'production'} mode...{Colors.ENDC}")
    print(f"{Colors.GREEN}Press Ctrl+C to stop the bot{Colors.ENDC}")
    
    process = None
    try:
        # Use different approach based on the operating system
        if platform.system() == 'Windows':
            process = subprocess.Popen(command, 
                                      creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            
            try:
                # Wait for keyboard interrupt
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print(f"\n{Colors.BLUE}Stopping bot due to keyboard interrupt...{Colors.ENDC}")
                # On Windows, try to use CTRL_C_EVENT first
                try:
                    os.kill(process.pid, signal.CTRL_C_EVENT)
                    # Give it time to exit gracefully
                    for _ in range(5):
                        if process.poll() is not None:
                            break
                        time.sleep(1)
                except Exception as e:
                    print(f"{Colors.WARNING}Failed to send Ctrl+C event: {e}{Colors.ENDC}")
        else:
            # For Unix-like systems
            process = subprocess.Popen(command)
            try:
                process.wait()
            except KeyboardInterrupt:
                print(f"\n{Colors.BLUE}Stopping bot due to keyboard interrupt...{Colors.ENDC}")
                process.send_signal(signal.SIGINT)
                # Give some time for graceful shutdown
                time.sleep(2)
            
    except Exception as e:
        print(f"{Colors.FAIL}Error running bot: {e}{Colors.ENDC}")
    finally:
        # Make sure process is forcefully terminated if it's still running
        ensure_process_terminated(process)
        print(f"{Colors.GREEN}Bot has been shut down.{Colors.ENDC}")

# Function to kill any existing Node.js processes related to the bot
def kill_existing_processes():
    print(f"{Colors.BLUE}Checking for existing bot processes...{Colors.ENDC}")
    
    try:
        if platform.system() == 'Windows':
            # On Windows, use tasklist and taskkill
            # Find ts-node or node processes
            result = subprocess.run(
                'tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH',
                capture_output=True,
                text=True,
                shell=True
            )
            
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if not line:
                    continue
                    
                # Parse the CSV output
                parts = line.strip('"').split('","')
                if len(parts) >= 2:
                    pid = parts[1]
                    # Use taskkill to terminate
                    print(f"{Colors.WARNING}Killing existing Node.js process with PID {pid}{Colors.ENDC}")
                    subprocess.run(f'taskkill /F /PID {pid}', shell=True)
        else:
            # On Unix-like systems, use pkill
            print(f"{Colors.BLUE}Checking for existing Node.js processes...{Colors.ENDC}")
            subprocess.run(['pkill', '-f', 'ts-node|node.*index.js'])
            
        # Give a moment for processes to terminate
        time.sleep(1)
        print(f"{Colors.GREEN}Process environment is clean.{Colors.ENDC}")
    except Exception as e:
        print(f"{Colors.WARNING}Error checking for existing processes: {e}{Colors.ENDC}")

# Make sure a process is terminated completely
def ensure_process_terminated(process):
    if process is None:
        return
        
    try:
        # Check if the process is still running
        if process.poll() is None:
            # Try to terminate gracefully first
            print(f"{Colors.WARNING}Process still running. Sending terminate signal...{Colors.ENDC}")
            process.terminate()
            
            # Give it a few seconds to terminate
            for i in range(5):
                if process.poll() is not None:
                    print(f"{Colors.GREEN}Process terminated successfully.{Colors.ENDC}")
                    return
                time.sleep(1)
                
            # If still running, kill it forcefully
            if process.poll() is None:
                print(f"{Colors.WARNING}Process did not terminate. Killing forcefully...{Colors.ENDC}")
                process.kill()
                process.wait(timeout=2)
                print(f"{Colors.GREEN}Process killed.{Colors.ENDC}")
    except Exception as e:
        print(f"{Colors.FAIL}Error while terminating process: {e}{Colors.ENDC}")

# Clean build artifacts
def clean_project():
    print(f"{Colors.BLUE}Cleaning project...{Colors.ENDC}")
    
    # Remove dist directory
    if os.path.exists('dist'):
        try:
            shutil.rmtree('dist')
            print(f"{Colors.GREEN}Removed dist directory{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}Error removing dist directory: {e}{Colors.ENDC}")
    
    # Remove node_modules
    if os.path.exists('node_modules'):
        print(f"{Colors.BLUE}Removing node_modules (this may take a moment)...{Colors.ENDC}")
        try:
            shutil.rmtree('node_modules')
            print(f"{Colors.GREEN}Removed node_modules directory{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}Error removing node_modules: {e}{Colors.ENDC}")
    
    print(f"{Colors.GREEN}Clean complete!{Colors.ENDC}")
    return True

# Show help information
def show_help():
    print(f"{Colors.HEADER}The Vixen - Discord Bot Manager{Colors.ENDC}")
    print(f"{Colors.HEADER}============================{Colors.ENDC}")
    print("A utility script to manage your TypeScript Discord bot")
    print("")
    print(f"{Colors.BOLD}Usage:{Colors.ENDC}")
    print("  python bot_manager.py [command] [options]")
    print("")
    print(f"{Colors.BOLD}Commands:{Colors.ENDC}")
    print("  start       Build and run the bot")
    print("  dev         Run in development mode (ts-node)")
    print("  build       Only build the TypeScript code")
    print("  clean       Remove build artifacts (dist folder)")
    print("  init        Initialize/check all required files")
    print("  help        Show this help information")
    print("")
    print(f"{Colors.BOLD}Options:{Colors.ENDC}")
    print("  --skip-build    Skip building when using the start command")
    print("  --force-clean   Force clean before building")
    print("")
    print(f"{Colors.BOLD}Examples:{Colors.ENDC}")
    print("  python bot_manager.py start        # Build and run the bot")
    print("  python bot_manager.py dev          # Run in development mode")
    print("  python bot_manager.py clean        # Clean the project")
    print("")

# Main function
def main():
    print(f"{Colors.HEADER}{Colors.BOLD}The Vixen - Discord Bot Manager{Colors.ENDC}")
    print(f"{Colors.HEADER}{'=' * 40}{Colors.ENDC}")
    
    # Parse command line arguments
    if len(sys.argv) < 2 or sys.argv[1] == 'help':
        show_help()
        return 0
    
    command = sys.argv[1].lower()
    options = sys.argv[2:]
    
    # Check npm is available
    npm_cmd = get_npm_command()
    if npm_cmd is None and command not in ['help', 'init']:
        print(f"{Colors.FAIL}Error: npm not found. Please install Node.js and npm.{Colors.ENDC}")
        return 1
    
    # Process commands
    if command == 'init':
        # Initialize/check all required files
        success = True
        success = check_package_json() and success
        success = check_tsconfig() and success
        success = check_env_file() and success
        
        if success:
            print(f"{Colors.GREEN}All configuration files are present.{Colors.ENDC}")
            
            # Check dependencies
            if npm_cmd:
                check_dependencies()
            else:
                print(f"{Colors.WARNING}npm not found. Please install Node.js and npm to complete initialization.{Colors.ENDC}")
                
            return 0
        return 1
        
    elif command == 'clean':
        # Clean build artifacts
        return 0 if clean_project() else 1
        
    elif command == 'build':
        # Build TypeScript code
        # Check for required files first
        if not check_env_file():
            return 1
        if not check_dependencies():
            return 1
            
        # Clean if requested
        if '--force-clean' in options:
            clean_project()
            
        # Build the code
        return 0 if build_typescript() else 1
        
    elif command == 'start':
        # Run in production mode
        # Check for required files first
        if not check_env_file():
            return 1
        if not check_dependencies():
            return 1
            
        # Clean if requested
        if '--force-clean' in options:
            clean_project()
            
        # Build unless skipped
        if '--skip-build' not in options:
            if not build_typescript():
                return 1
                
        # Run the bot
        run_bot(dev_mode=False)
        return 0
        
    elif command == 'dev':
        # Run in development mode
        # Check for required files first
        if not check_env_file():
            return 1
        if not check_dependencies():
            return 1
            
        # Run the bot in dev mode
        run_bot(dev_mode=True)
        return 0
        
    else:
        print(f"{Colors.FAIL}Unknown command: {command}{Colors.ENDC}")
        show_help()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())