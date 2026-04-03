#!/bin/bash

# ViteCredit Health Tracking App - Local Development Start Script
# This script sets up and runs the entire application locally

set -e

echo "🚀 ViteCredit Health Tracking App - Starting Local Development"
echo "==========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}❌ Please configure your Firebase credentials in .env file${NC}"
    echo -e "${YELLOW}📝 Required environment variables:${NC}"
    echo "   - VITE_FIREBASE_API_KEY"
    echo "   - VITE_FIREBASE_AUTH_DOMAIN"
    echo "   - VITE_FIREBASE_PROJECT_ID"
    echo "   - VITE_FIREBASE_STORAGE_BUCKET"
    echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID"
    echo "   - VITE_FIREBASE_APP_ID"
    echo "   - VITE_GOOGLE_API_KEY"
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run npm scripts
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""
echo -e "${YELLOW}📋 Available commands:${NC}"
echo "   npm run dev       - Start development server on http://localhost:3000"
echo "   npm run build     - Build for production"
echo "   npm run preview   - Preview production build"
echo "   npm run lint      - Run TypeScript linting"
echo ""

# Start development server
echo -e "${GREEN}🎯 Starting Vite development server...${NC}"
echo -e "${YELLOW}💡 Open http://localhost:3000 in your browser${NC}"
echo ""

npm run dev
