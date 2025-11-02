#!/bin/bash
# Setup script for Dispensary Intelligence Analyst
# For Mac and Linux users

echo "========================================="
echo "Dispensary Intelligence Analyst - Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "Visit: https://nodejs.org"
    echo ""
    echo "Or on Linux, run:"
    echo "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed!"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
else
    echo ""
    echo "❌ Failed to install dependencies"
    echo "Please check your internet connection and try again."
    exit 1
fi

# Build the project
echo ""
echo "🔨 Building the project..."
echo ""

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
else
    echo ""
    echo "❌ Build failed"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating configuration file..."
    cp .env.example .env
    echo "✅ Configuration file created (.env)"
    echo "   You can edit this file to customize settings"
fi

# Make scripts executable
chmod +x run-report.sh
chmod +x run-ptl-verification.sh
chmod +x run-vendor-tracker.sh
chmod +x run-alerts-demo.sh

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run your first report:"
echo "   ./run-report.sh"
echo ""
echo "2. Try other reports:"
echo "   ./run-ptl-verification.sh"
echo "   ./run-vendor-tracker.sh"
echo "   ./run-alerts-demo.sh"
echo ""
echo "3. Customize settings:"
echo "   Edit the .env file"
echo ""
echo "For more help, see SETUP_GUIDE.md"
echo ""
