#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏗️  Local Build and Push Script${NC}"
echo ""

# Check if APP_IMAGE is set
if [ -z "$APP_IMAGE" ]; then
    echo -e "${RED}❌ APP_IMAGE environment variable not set${NC}"
    echo -e "${YELLOW}Usage: APP_IMAGE=ghcr.io/username/repo:latest ./build-push.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker image: ${APP_IMAGE}${NC}"
docker build -t "$APP_IMAGE" .

echo ""
echo -e "${YELLOW}🚀 Pushing to registry...${NC}"
docker push "$APP_IMAGE"

echo ""
echo -e "${GREEN}✅ Build and push complete!${NC}"
echo -e "${GREEN}Image: ${APP_IMAGE}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Set APP_IMAGE in server's .env.production"
echo -e "2. Run deploy.sh on server to pull and deploy"
