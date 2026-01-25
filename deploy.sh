#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Production Deployment Script${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo -e "${YELLOW}📝 Creating from template...${NC}"
    cp .env.production.example .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production with your settings before continuing${NC}"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

# Validate required variables
REQUIRED_VARS=("POSTGRES_PASSWORD" "BETTER_AUTH_SECRET" "APP_URL" "ACME_EMAIL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"
echo ""

# Note: APP_IMAGE should be set in environment or .env.production
# Example: APP_IMAGE=ghcr.io/your-username/your-repo:latest

# Pull latest images (including pre-built app image)
echo -e "${YELLOW}📦 Pulling latest Docker images...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yaml pull

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yaml down

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yaml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yaml exec -T app sh -c "cd /app && node_modules/.bin/drizzle-kit migrate"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${GREEN}📊 Service Status:${NC}"
docker compose --env-file .env.production -f docker-compose.prod.yaml ps
echo ""
echo -e "${GREEN}🌐 Your app is available at:${NC}"
echo -e "   App: ${APP_URL}"
echo -e "   Electric: https://${ELECTRIC_DOMAIN}"
echo ""
echo -e "${YELLOW}📝 View logs with: docker compose -f docker-compose.prod.yaml logs -f${NC}"
