# Deployment Guide

This guide covers all deployment methods for Nuxt Fullstack MCP, including Docker containerization, NPM publishing, and automated CI/CD workflows.

## 🚀 Quick Deployment Options

### Option 1: NPM Package (Recommended for Development)

```bash
# Install in a Nuxt project
npx nuxi@latest module add nuxt-mcp

# Or install manually
npm install nuxt-mcp
```

### Option 2: Docker Container (Recommended for Production)

```bash
# Pull and run the latest version
docker pull nuxt-fullstack-mcp:latest
docker run -p 3000:3000 nuxt-fullstack-mcp:latest

# Or use docker-compose for full stack
curl -O https://raw.githubusercontent.com/your-org/nuxt-fullstack-mcp/main/docker-compose.yml
docker-compose up -d
```

### Option 3: Manual Build and Deploy

```bash
# Clone and build
git clone https://github.com/your-org/nuxt-fullstack-mcp.git
cd nuxt-fullstack-mcp
pnpm install
pnpm build

# Run in production mode
pnpm start
```

## 🐳 Docker Deployment

### Building Docker Images

#### Local Build
```bash
# Build for local testing
pnpm docker:build

# Run locally
pnpm docker:run

# Or use docker-compose for development
pnpm docker:dev
```

#### Multi-platform Build
```bash
# Build for multiple architectures
docker buildx create --use --name multiplatform-builder
docker buildx build --platform linux/amd64,linux/arm64 -t nuxt-fullstack-mcp:latest .
```

### Docker Compose Configuration

The included `docker-compose.yml` provides a complete stack:

```yaml
services:
  nuxt-fullstack-mcp:
    image: nuxt-fullstack-mcp:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data

  redis:        # Optional: Session storage
  database:     # Optional: PostgreSQL database
```

#### Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (auto-detected when present)
DATABASE_URL=postgresql://user:password@localhost:5432/nuxt_mcp
DATABASE_AUTH_TOKEN=your-token

# Authentication (auto-detected when present)
NUXT_OAUTH_GITHUB_CLIENT_ID=your-client-id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-secret
NUXT_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-google-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379

# MCP Configuration
MCP_SERVER_PORT=3000
MCP_INCLUDE_NUXT_DOCS=true
```

### Production Docker Deployment

#### Using Docker Hub
```bash
# Latest stable release
docker pull nuxt-fullstack-mcp:latest

# Specific version
docker pull nuxt-fullstack-mcp:v2.0.0

# Development version
docker pull nuxt-fullstack-mcp:dev
```

#### Using Docker Compose in Production
```bash
# Download production compose file
curl -O https://raw.githubusercontent.com/your-org/nuxt-fullstack-mcp/main/docker-compose.yml

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Health Checks and Monitoring

The Docker image includes health checks:

```bash
# Check container health
docker ps
# Look for "healthy" status

# Manual health check
curl http://localhost:3000/__mcp/health

# View health check logs
docker inspect --format='{{json .State.Health}}' container-name
```

## 📦 Release Management

### Automated Release Process

The project uses GitHub Actions for automated releases:

1. **Create a Release**:
   ```bash
   # Using the release script (recommended)
   ./scripts/release.sh 2.0.0
   
   # Or manually create a tag
   git tag -a v2.0.0 -m "Release v2.0.0"
   git push origin v2.0.0
   ```

2. **GitHub Actions Workflow**:
   - ✅ Runs full test suite
   - 📦 Publishes to NPM
   - 🐳 Builds and pushes Docker images (multi-platform)
   - 📝 Creates GitHub release with changelog

3. **Manual Release**:
   ```bash
   # Build and test locally
   pnpm build
   pnpm test
   pnpm test:integration
   
   # Publish to NPM
   pnpm publish --access public
   
   # Build and push Docker image
   ./scripts/docker-push.sh 2.0.0 latest
   ```

### Release Script Usage

```bash
# Full release with version validation and testing
./scripts/release.sh 2.0.0

# What the script does:
# ✅ Validates semantic versioning
# ✅ Checks git status and branch
# ✅ Runs full test suite
# ✅ Updates package.json versions
# ✅ Updates CHANGELOG.md
# ✅ Creates and pushes git tag
# ✅ Tests Docker build locally
```

### Docker Push Script

```bash
# Build and push to Docker Hub
./scripts/docker-push.sh 2.0.0 latest

# Features:
# ✅ Multi-platform build (amd64, arm64)
# ✅ Automatic tagging
# ✅ Push to Docker Hub
# ✅ Container testing
# ✅ Health check validation
```

## 🔧 CI/CD Configuration

### GitHub Actions Workflows

#### 1. Release Workflow (`.github/workflows/release.yml`)
Triggered on tag push (`v*`):
- Runs tests and quality checks
- Publishes to NPM with provenance
- Builds multi-platform Docker images
- Creates GitHub release with changelog

#### 2. Docker Build Workflow (`.github/workflows/docker-build.yml`)
Triggered on push/PR:
- Tests Docker build
- Runs container health checks
- Pushes dev images on main branch

#### 3. Required Secrets

Set these in GitHub repository secrets:

```bash
# NPM Publishing
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx

# Docker Hub Publishing
DOCKERHUB_USERNAME=your-dockerhub-username
DOCKERHUB_TOKEN=dckr_pat_xxxxxxxxxxxxxxxxxxxx

# GitHub Token (automatically provided)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### Manual CI/CD Setup

If not using GitHub Actions, configure your CI/CD with:

```bash
# Test pipeline
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration

# Build pipeline
pnpm build

# Publish pipeline
pnpm publish --access public --no-git-checks
docker buildx build --platform linux/amd64,linux/arm64 --push -t nuxt-fullstack-mcp:latest .
```

## 🌐 Production Deployment Strategies

### 1. Container Orchestration

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nuxt-fullstack-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nuxt-fullstack-mcp
  template:
    metadata:
      labels:
        app: nuxt-fullstack-mcp
    spec:
      containers:
      - name: nuxt-fullstack-mcp
        image: nuxt-fullstack-mcp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /__mcp/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /__mcp/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nuxt-mcp-stack

# Scale services
docker service scale nuxt-mcp-stack_nuxt-fullstack-mcp=3
```

### 2. Cloud Platform Deployment

#### AWS ECS
```bash
# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster my-cluster \
  --service-name nuxt-fullstack-mcp \
  --task-definition nuxt-fullstack-mcp:1 \
  --desired-count 2
```

#### Google Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy nuxt-fullstack-mcp \
  --image gcr.io/PROJECT-ID/nuxt-fullstack-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Heroku
```bash
# Deploy to Heroku using Docker
heroku create nuxt-fullstack-mcp
heroku container:push web
heroku container:release web
```

### 3. Performance and Scaling

#### Load Balancing
```nginx
# Nginx configuration
upstream nuxt_mcp_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://nuxt_mcp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Monitoring
```bash
# Container monitoring with Prometheus
docker run -d \
  --name=prometheus \
  -p 9090:9090 \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Application monitoring
docker run -d \
  --name=grafana \
  -p 3001:3000 \
  grafana/grafana
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Docker Build Failures
```bash
# Check build context
ls -la .dockerignore

# Build with no cache
docker build --no-cache -t nuxt-fullstack-mcp .

# Check system resources
docker system df
docker system prune
```

#### 2. Container Won't Start
```bash
# Check logs
docker logs container-name

# Check resource constraints
docker stats container-name

# Test locally
docker run -it nuxt-fullstack-mcp:latest /bin/sh
```

#### 3. Health Check Failures
```bash
# Test health endpoint manually
curl -v http://localhost:3000/__mcp/health

# Check container network
docker network ls
docker inspect container-name
```

#### 4. NPM Publishing Issues
```bash
# Check authentication
npm whoami

# Check package scope
npm config get registry

# Test publish (dry run)
npm publish --dry-run
```

### Performance Optimization

#### 1. Docker Image Size
```bash
# Analyze image layers
docker history nuxt-fullstack-mcp:latest

# Use dive for detailed analysis
dive nuxt-fullstack-mcp:latest
```

#### 2. Runtime Performance
```bash
# Monitor container resources
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Profile Node.js application
NODE_ENV=production node --prof app.js
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] All tests passing (`pnpm test`)
- [ ] Integration tests passing (`pnpm test:integration`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Type checking clean (`pnpm typecheck`)
- [ ] Docker build successful (`pnpm docker:build`)
- [ ] Environment variables configured
- [ ] Secrets properly set (NPM_TOKEN, DOCKERHUB_TOKEN)

### Deployment
- [ ] Version updated in package.json files
- [ ] CHANGELOG.md updated with release notes
- [ ] Git tag created and pushed
- [ ] GitHub Actions workflows successful
- [ ] NPM package published
- [ ] Docker images pushed to registry
- [ ] GitHub release created

### Post-deployment
- [ ] Application accessible at expected URL
- [ ] MCP server responding at `/__mcp/sse`
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notified of deployment

---

**Need Help?** Check the [README.md](./README.md) for usage instructions or open an issue on GitHub for deployment-specific questions.