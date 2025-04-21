#!/bin/bash

# Create a setup.sh file with this content

# Set error handling
set -e
echo "Starting installation of Consolidated Bills dependencies..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script with sudo or as root"
  exit 1
fi

# Function to install packages from a file
install_packages_from_file() {
  local file=$1
  local manager=$2
  
  if [ ! -f "$file" ]; then
    echo "File $file not found!"
    return 1
  fi
  
  echo "Installing packages from $file using $manager..."
  
  case $manager in
    apt)
      # Update package list first
      apt update
      # Read the file line by line, skipping comments and empty lines
      while IFS= read -r package || [ -n "$package" ]; do
        # Skip comments and empty lines
        [[ "$package" =~ ^#.*$ || -z "$package" ]] && continue
        echo "Installing $package..."
        apt install -y $package
      done < "$file"
      ;;
    npm)
      while IFS= read -r package || [ -n "$package" ]; do
        [[ "$package" =~ ^#.*$ || -z "$package" ]] && continue
        echo "Installing npm package $package..."
        npm install -g $package
      done < "$file"
      ;;
    pip)
      while IFS= read -r package || [ -n "$package" ]; do
        [[ "$package" =~ ^#.*$ || -z "$package" ]] && continue
        echo "Installing pip package $package..."
        pip3 install $package
      done < "$file"
      ;;
    *)
      echo "Unsupported package manager: $manager"
      return 1
      ;;
  esac
}

# Install system packages from apt
if [ -f "system_packages.txt" ]; then
  install_packages_from_file "system_packages.txt" "apt"
else
  echo "system_packages.txt not found, creating default one..."
  cat > system_packages.txt << EOF
# Core dependencies
docker.io
docker-compose
git
curl
wget
zip
unzip
software-properties-common
apt-transport-https
ca-certificates
gnupg
lsb-release
python3
python3-pip

# Required for Node.js
nodejs
npm

# Required for PHP
php8.2
php8.2-fpm
php8.2-cli
php8.2-common
php8.2-mysql
php8.2-zip
php8.2-gd
php8.2-mbstring
php8.2-curl
php8.2-xml
php8.2-bcmath
php8.2-intl
composer

# Database clients
mysql-client

# Web server
nginx
EOF
  
  install_packages_from_file "system_packages.txt" "apt"
fi

# Install Node.js global packages
if [ -f "npm_packages.txt" ]; then
  install_packages_from_file "npm_packages.txt" "npm"
else
  echo "npm_packages.txt not found, creating default one..."
  cat > npm_packages.txt << EOF
# Node.js global packages
artillery
faker
pm2
EOF
  
  install_packages_from_file "npm_packages.txt" "npm"
fi

# Install Python packages
if [ -f "python_packages.txt" ]; then
  install_packages_from_file "python_packages.txt" "pip"
else
  echo "python_packages.txt not found, creating default one..."
  cat > python_packages.txt << EOF
# Python packages
boto3
awscli
EOF
  
  install_packages_from_file "python_packages.txt" "pip"
fi

# Install Terraform
if ! command -v terraform &> /dev/null; then
    echo "Installing Terraform..."
    wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
    apt update && apt install -y terraform
fi

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip
fi

# Setup Docker for current user
if getent group docker > /dev/null 2>&1; then
    echo "Adding current user to docker group..."
    usermod -aG docker $SUDO_USER
fi

echo "Installation complete! You may need to log out and back in for some changes to take effect."
echo "Remember to configure AWS credentials with 'aws configure' if you plan to deploy to AWS."

# Add project-specific setup
echo "Setting up the Consolidated Bills project directory structure..."
PROJECT_DIR="/home/$SUDO_USER/consolidated_bills"

# Create directory structure if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p $PROJECT_DIR
    mkdir -p $PROJECT_DIR/infra/terraform
    mkdir -p $PROJECT_DIR/infra/monitoring
    mkdir -p $PROJECT_DIR/backend/php-biller
    mkdir -p $PROJECT_DIR/backend/node-user-service/tests/load
    mkdir -p $PROJECT_DIR/frontend
    mkdir -p $PROJECT_DIR/docker/nginx/conf.d
    
    # Set ownership
    chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR
    
    echo "Project directory structure created at $PROJECT_DIR"
fi

echo "Setup complete for Consolidated Bills project!"
