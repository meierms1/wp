#!/bin/bash
set -e

echo "🚀 Building full-stack application..."

# Build React frontend
echo "📦 Building React frontend..."
cd frontend
npm ci --only=production
npm run build
echo "✅ Frontend build complete"

# Create static directory and copy build
echo "📂 Setting up static files..."
cd ..
mkdir -p static/frontend
cp -r frontend/build/* static/frontend/
echo "✅ Static files ready"

# Test Flask app
echo "🧪 Testing Flask app..."
python -c "from backend.app import app; print('✅ Flask app loads successfully')"

echo "🎉 Build complete! Ready for deployment."
echo ""
echo "Next steps:"
echo "  1. Build Docker image: docker build -t your-app ."
echo "  2. Run locally: docker run -p 8080:8080 your-app"
echo "  3. Or deploy to Zeet using your Git repository"
