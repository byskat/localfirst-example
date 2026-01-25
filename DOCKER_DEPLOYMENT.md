# Production Docker Deployment

Simple production deployment using Docker Compose. Works on any server with Docker installed.

## Quick Start

### 1. Get a Server

Choose any VPS provider:
- **DigitalOcean** - $6/month droplet
- **Hetzner** - €4.5/month VPS
- **Linode** - $5/month
- **Vultr** - $6/month

Minimum specs: 1 CPU, 1GB RAM, 25GB storage

### 2. Install Docker

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and back in for group changes to take effect.

### 3. Point Your Domain

Add DNS A records pointing to your server's IP:
- `yourdomain.com` → `your.server.ip`
- `electric.yourdomain.com` → `your.server.ip`

### 4. Clone and Configure

```bash
git clone your-repo-url demo-electric
cd demo-electric

# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production
```

**Required settings in `.env.production`:**

```bash
# Strong password for database
POSTGRES_PASSWORD=your-super-secure-password-here

# Your actual domains
APP_DOMAIN=yourdomain.com
APP_URL=https://yourdomain.com
ELECTRIC_DOMAIN=electric.yourdomain.com

# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-generated-secret-here

# Your email for Let's Encrypt
ACME_EMAIL=your-email@example.com
```

### 5. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

That's it! 🎉

Your app will be available at `https://yourdomain.com` with automatic HTTPS.

## Management Commands

### View logs
```bash
docker compose -f docker-compose.prod.yaml logs -f
docker compose -f docker-compose.prod.yaml logs -f app
```

### Restart services
```bash
docker compose -f docker-compose.prod.yaml restart
```

### Update to latest code
```bash
git pull
./deploy.sh
```

### Stop everything
```bash
docker compose -f docker-compose.prod.yaml down
```

### Backup database
```bash
docker compose -f docker-compose.prod.yaml exec postgres pg_dump -U postgres electric > backup.sql
```

### Restore database
```bash
cat backup.sql | docker compose -f docker-compose.prod.yaml exec -T postgres psql -U postgres electric
```

### Access database console
```bash
docker compose -f docker-compose.prod.yaml exec postgres psql -U postgres electric
```

### View resource usage
```bash
docker stats
```

## Architecture

The setup includes:

- **PostgreSQL** - Database with logical replication for Electric
- **Electric** - Real-time sync service at `electric.yourdomain.com`
- **App** - Your TanStack Start application at `yourdomain.com`
- **Caddy** - Reverse proxy with automatic HTTPS via Let's Encrypt

All services are connected via internal Docker networks and monitored with health checks.

## Security Features

✅ Automatic HTTPS with Let's Encrypt
✅ HTTP/3 support via Caddy
✅ Services on internal network
✅ Non-root user in containers
✅ Health checks and auto-restart
✅ Automatic security headers

## Cost Estimate

**DigitalOcean Droplet ($6/month):**
- 1 vCPU
- 1GB RAM
- 25GB SSD
- 1TB transfer

Perfect for small to medium traffic. Upgrade as needed.

## Troubleshooting

### Services won't start

Check logs:
```bash
docker compose -f docker-compose.prod.yaml logs
```

### Can't access via domain

1. Verify DNS is pointing to server: `dig yourdomain.com`
2. Check Caddy logs: `docker compose -f docker-compose.prod.yaml logs caddy`
3. Ensure ports 80 and 443 are open in firewall

### Database connection errors

```bash
# Check if Postgres is healthy
docker compose -f docker-compose.prod.yaml ps postgres

# Check Postgres logs
docker compose -f docker-compose.prod.yaml logs postgres
```

### Let's Encrypt rate limits

If testing, use Caddy's staging environment by updating `Caddyfile.prod`:
```
{
    email {$ACME_EMAIL}
    acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
}
```

## Development vs Production

- **Development** (`docker-compose.yaml`):
  - Uses Caddy with local certs
  - Exposes services on localhost
  - Insecure Electric
  - Hot reload

- **Production** (`docker-compose.prod.yaml`):
  - Caddy reverse proxy with Let's Encrypt
  - Automatic HTTPS with HTTP/3
  - Internal networking only
  - Secure Electric
  - Health checks
  - Auto-restart policies

## Updating

To deploy updates:

```bash
git pull
./deploy.sh
```

The script will:
1. Pull latest images
2. Rebuild app
3. Recreate containers
4. Run new migrations
5. Zero-downtime deployment (Traefik handles rolling updates)

## Monitoring

Consider adding:
- **Uptime monitoring**: UptimeRobot (free tier)
- **Error tracking**: Sentry
- **Analytics**: Plausible or Umami

## Scaling

When you outgrow a single server:
1. Migrate to managed Postgres (DigitalOcean, AWS RDS)
2. Deploy app to multiple servers with load balancer
3. Use managed Electric or scale horizontally

But the single-server setup handles surprising amounts of traffic!
