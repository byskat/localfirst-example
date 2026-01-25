# DigitalOcean Deployment Guide

Complete step-by-step guide to deploy your app to DigitalOcean with automated CI/CD.

## Part 1: Initial Server Setup (One-time)

### Step 1: Create a Droplet

1. Go to [DigitalOcean Cloud](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose configuration:
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic ($6/month)
     - Regular CPU
     - 1 GB RAM / 1 CPU
     - 25 GB SSD
     - 1000 GB transfer
   - **Region**: Choose closest to your users (e.g., San Francisco)
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `demo-electric-prod` (or your choice)
4. Click **Create Droplet**
5. **Save your droplet's IP address** (you'll need this)

### Step 2: Configure DNS

#### Option A: Free Domain (No Registration Required!) ✨

Use **nip.io** or **sslip.io** - free wildcard DNS that works with Let's Encrypt!

If your droplet IP is `123.45.67.89`, your domains are automatically:
- **App**: `123.45.67.89.nip.io` or `app-123-45-67-89.sslip.io`
- **Electric**: `electric.123.45.67.89.nip.io` or `electric-123-45-67-89.sslip.io`

**No setup needed!** These domains instantly resolve to your IP. Skip to Step 3.

**For .env.production, use:**
```bash
APP_DOMAIN=123.45.67.89.nip.io
APP_URL=https://123.45.67.89.nip.io
ELECTRIC_DOMAIN=electric.123.45.67.89.nip.io
```

Replace `123.45.67.89` with your actual droplet IP.

#### Option B: Custom Domain (If You Own One)

1. Go to your domain registrar (Namecheap, Cloudflare, etc.)
2. Add these DNS A records pointing to your droplet's IP:
   ```
   yourdomain.com          →  your.droplet.ip
   electric.yourdomain.com →  your.droplet.ip
   ```
3. Wait 5-10 minutes for DNS propagation
4. Verify with: `dig yourdomain.com` (should show your droplet IP)

### Step 3: Initial Server Setup

SSH into your droplet:
```bash
ssh root@your.droplet.ip
```

Update system and install Docker:
```bash
# Update packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker on boot
systemctl enable docker
systemctl start docker

# Install Docker Compose (if not included)
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 4: Create Deployment User

Create a non-root user for deployments:
```bash
# Create deploy user
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Set up SSH for deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Test the deploy user:
```bash
ssh deploy@your.droplet.ip
```

### Step 5: Clone Your Repository

As the `deploy` user:
```bash
cd /home/deploy
git clone https://github.com/your-username/your-repo.git demo-electric
cd demo-electric
```

### Step 6: Configure Environment Variables

Generate a secure secret:
```bash
openssl rand -base64 32
```

Create production environment file:
```bash
cd /home/deploy/demo-electric
cp .env.production.example .env.production
nano .env.production
```

Fill in your actual values:
```bash
POSTGRES_DB=electric
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SUPER_SECURE_PASSWORD_HERE

# If using free domain (nip.io), replace 123.45.67.89 with your droplet IP
APP_DOMAIN=123.45.67.89.nip.io
APP_URL=https://123.45.67.89.nip.io
ELECTRIC_DOMAIN=electric.123.45.67.89.nip.io

# Or if you have a custom domain:
# APP_DOMAIN=yourdomain.com
# APP_URL=https://yourdomain.com
# ELECTRIC_DOMAIN=electric.yourdomain.com

ELECTRIC_INSECURE=false
ELECTRIC_AUTH_MODE=secure

BETTER_AUTH_SECRET=YOUR_GENERATED_SECRET_FROM_ABOVE

ACME_EMAIL=your-email@example.com
```

Save and exit (Ctrl+X, Y, Enter).

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp  # HTTP/3

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Step 8: Initial Deployment

Run the deployment script:
```bash
cd /home/deploy/demo-electric
./deploy.sh
```

This will:
- Pull Docker images
- Build your app
- Start all services (Postgres, Electric, App, Caddy)
- Run database migrations
- Set up automatic HTTPS

### Step 9: Verify Deployment

Check services are running:
```bash
docker compose -f docker-compose.prod.yaml ps
```

All services should show "healthy" status.

View logs:
```bash
docker compose -f docker-compose.prod.yaml logs -f
```

Visit your app:
- Free domain: `https://123.45.67.89.nip.io` (replace with your IP)
- Custom domain: `https://yourdomain.com`

If everything works, proceed to CI/CD setup! 🎉

---

## Part 2: GitHub Actions CI/CD Setup

### Step 1: Generate Deployment SSH Key

On your **local machine**, generate a dedicated SSH key for deployments:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key
```

This creates two files:
- `deploy_key` (private key)
- `deploy_key.pub` (public key)

### Step 2: Add Public Key to Server

Copy the public key to your server:

```bash
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@your.droplet.ip
```

Or manually:
```bash
# Show the public key
cat ~/.ssh/deploy_key.pub

# SSH into server and add it
ssh deploy@your.droplet.ip
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

Test the key works:
```bash
ssh -i ~/.ssh/deploy_key deploy@your.droplet.ip
```

### Step 3: Get SSH Known Hosts

From your local machine:
```bash
ssh-keyscan -H your.droplet.ip
```

Copy the output (starts with your IP and contains a long key).

### Step 4: Configure GitHub Secrets

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

| Secret Name | Value | Example |
|------------|-------|---------|
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/deploy_key` | `cat ~/.ssh/deploy_key` |
| `SSH_KNOWN_HOSTS` | Output from ssh-keyscan | From Step 3 above |
| `SSH_HOST` | Your droplet IP address | `123.45.67.89` |
| `SSH_USER` | Deployment username | `deploy` |
| `DEPLOY_PATH` | Path to app on server | `/home/deploy/demo-electric` |
| `POSTGRES_DB` | Database name | `electric` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | Same as .env.production |
| `APP_DOMAIN` | Your app domain | `yourdomain.com` |
| `APP_URL` | Full app URL | `https://yourdomain.com` |
| `ELECTRIC_DOMAIN` | Electric subdomain | `electric.yourdomain.com` |
| `BETTER_AUTH_SECRET` | Auth secret | Same as .env.production |
| `ACME_EMAIL` | Your email | `your-email@example.com` |

**To get private key contents:**
```bash
cat ~/.ssh/deploy_key
```

Copy the **entire output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...everything in between...
-----END OPENSSH PRIVATE KEY-----
```

### Step 5: Commit GitHub Actions Workflow

The workflow file is already in `.github/workflows/deploy.yml`.

Commit and push it:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

### Step 6: Test Automated Deployment

Make a small change to test the deployment:
```bash
# Make any small change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test automated deployment"
git push origin main
```

Watch the deployment in GitHub:
1. Go to your repository
2. Click **Actions** tab
3. You should see your workflow running
4. Click on it to see real-time logs

### Step 7: Manual Deployment Trigger

You can also trigger deployments manually:
1. Go to **Actions** tab
2. Select **Deploy to DigitalOcean** workflow
3. Click **Run workflow** → **Run workflow**

---

## Deployment Workflow

Once set up, every push to `main` will:

1. ✅ Checkout latest code
2. ✅ SSH into your server
3. ✅ Pull latest code from git
4. ✅ Build new Docker image for app
5. ✅ Pull latest images for other services
6. ✅ Deploy with zero-downtime
7. ✅ Run database migrations
8. ✅ Clean up old images

**Typical deployment time**: 2-3 minutes

---

## Useful Commands

### On Your Server

```bash
# SSH into server
ssh deploy@your.droplet.ip

# Navigate to app
cd /home/deploy/demo-electric

# View logs
docker compose -f docker-compose.prod.yaml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yaml logs -f app
docker compose -f docker-compose.prod.yaml logs -f electric
docker compose -f docker-compose.prod.yaml logs -f caddy

# Check service status
docker compose -f docker-compose.prod.yaml ps

# Restart services
docker compose -f docker-compose.prod.yaml restart

# Manual deployment
./deploy.sh

# Access database
docker compose -f docker-compose.prod.yaml exec postgres psql -U postgres electric

# View resource usage
docker stats

# Clean up old images
docker image prune -a -f

# Full cleanup (CAREFUL!)
docker compose -f docker-compose.prod.yaml down -v
```

### Monitoring

Check if your app is up:
```bash
curl -I https://yourdomain.com
```

Check SSL certificate:
```bash
curl -vI https://yourdomain.com 2>&1 | grep -i "SSL\|TLS"
```

Monitor disk space:
```bash
df -h
```

---

## Troubleshooting

### Deployment fails in GitHub Actions

1. Check the Actions logs in GitHub
2. Verify all secrets are set correctly
3. Test SSH manually: `ssh -i ~/.ssh/deploy_key deploy@your.droplet.ip`
4. Check server logs: `docker compose -f docker-compose.prod.yaml logs`

### Can't access the site

1. Check DNS propagation: `dig yourdomain.com`
2. Check Caddy logs: `docker compose -f docker-compose.prod.yaml logs caddy`
3. Verify firewall: `sudo ufw status`
4. Check if services are running: `docker compose -f docker-compose.prod.yaml ps`

### SSL certificate issues

Caddy handles HTTPS automatically. If issues:
1. Check Caddy logs for ACME errors
2. Verify DNS is correct
3. Ensure ports 80 and 443 are open
4. Let's Encrypt has rate limits - wait if hit

### Database connection errors

1. Check Postgres is healthy: `docker compose -f docker-compose.prod.yaml ps postgres`
2. View Postgres logs: `docker compose -f docker-compose.prod.yaml logs postgres`
3. Verify DATABASE_URL in .env.production

### Out of disk space

```bash
# Check space
df -h

# Clean Docker
docker system prune -a -f
docker volume prune -f
```

---

## Cost Breakdown

**DigitalOcean Droplet**: $6/month
- 1 vCPU
- 1 GB RAM
- 25 GB SSD
- 1 TB transfer

**Total**: $6/month 💰

Upgrade to 2GB RAM ($12/month) if you see performance issues.

---

## Security Best Practices

✅ Use SSH keys (not passwords)
✅ Non-root deployment user
✅ Firewall configured (UFW)
✅ Automatic HTTPS with Caddy
✅ Strong database passwords
✅ Environment variables not in code
✅ GitHub secrets for CI/CD

---

## Upgrading/Scaling

When you need more resources:

1. **Resize droplet** (DigitalOcean console)
2. **Add more droplets** with load balancer
3. **Use managed database** (DigitalOcean Postgres)
4. **Add monitoring** (UptimeRobot, Sentry)

---

## Next Steps

- [ ] Set up automated backups (DigitalOcean snapshots)
- [ ] Configure monitoring/alerts
- [ ] Set up staging environment
- [ ] Add health check endpoints
- [ ] Configure log rotation

Your app is now live with automated deployments! 🚀
