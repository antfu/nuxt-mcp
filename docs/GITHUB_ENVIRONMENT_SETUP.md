# GitHub Environment Setup Guide

This guide explains how to configure GitHub repository secrets and environment variables for automated CI/CD pipelines and Docker Hub publishing.

## 🔑 Required Secrets

### 1. NPM Publishing Secrets

#### `NPM_TOKEN`
**Purpose**: Authenticate with NPM registry for package publishing

**How to obtain**:
1. Login to [npmjs.com](https://npmjs.com)
2. Go to **Access Tokens** in your account settings
3. Generate a new **Automation** token (not Classic token)
4. Copy the token (starts with `npm_`)

**Set in GitHub**:
```bash
Repository Settings → Secrets and variables → Actions → New repository secret
Name: NPM_TOKEN
Value: npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### `NPM_CONFIG_PROVENANCE`
**Purpose**: Enable npm provenance for supply chain security
**Value**: `true` (set as environment variable, not secret)

### 2. Docker Hub Publishing Secrets

#### `DOCKERHUB_USERNAME`
**Purpose**: Docker Hub username for authentication

**How to obtain**:
1. Your Docker Hub username (case-sensitive)

**Set in GitHub**:
```bash
Repository Settings → Secrets and variables → Actions → New repository secret
Name: DOCKERHUB_USERNAME
Value: your-dockerhub-username
```

#### `DOCKERHUB_TOKEN`
**Purpose**: Docker Hub access token for secure authentication

**How to obtain**:
1. Login to [hub.docker.com](https://hub.docker.com)
2. Go to **Account Settings** → **Security**
3. Create **New Access Token**
4. Set **Description**: `GitHub Actions CI/CD`
5. Set **Permissions**: `Read, Write, Delete`
6. Copy the token (starts with `dckr_pat_`)

**Set in GitHub**:
```bash
Repository Settings → Secrets and variables → Actions → New repository secret
Name: DOCKERHUB_TOKEN
Value: dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. GitHub Token (Automatic)

#### `GITHUB_TOKEN`
**Purpose**: GitHub API access for creating releases and updating repository
**Configuration**: **Automatically provided** - no manual setup required

**Permissions needed** (set in repository settings):
```yaml
contents: write    # Create releases and tags
packages: write    # Publish to GitHub packages (if needed)
id-token: write    # For provenance
```

## 🏗️ GitHub Repository Configuration

### 1. Actions Permissions

Navigate to: `Repository Settings → Actions → General`

**Actions permissions**:
- ✅ Allow all actions and reusable workflows

**Workflow permissions**:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 2. Branch Protection Rules

Navigate to: `Repository Settings → Branches`

**Protect main/master branch**:
```yaml
Branch name pattern: main
Require a pull request before merging: ✅
Require status checks to pass before merging: ✅
Required status checks:
  - test
  - docker-build
Require branches to be up to date before merging: ✅
Require conversation resolution before merging: ✅
```

### 3. Repository Variables (Optional)

Navigate to: `Repository Settings → Secrets and variables → Actions → Variables`

#### `DOCKER_REGISTRY`
**Purpose**: Override default Docker registry
**Default**: `docker.io`
**Example**: `ghcr.io` (for GitHub Container Registry)

#### `DOCKER_IMAGE_NAME`
**Purpose**: Override default image name
**Default**: `nuxt-fullstack-mcp`
**Example**: `my-org/nuxt-fullstack-mcp`

## 📋 Step-by-Step Setup Checklist

### Phase 1: Docker Hub Setup
- [ ] Create Docker Hub account (if not exists)
- [ ] Create new repository: `nuxt-fullstack-mcp`
- [ ] Generate access token with Read/Write/Delete permissions
- [ ] Copy access token for GitHub setup

### Phase 2: NPM Setup
- [ ] Create NPM account (if not exists)
- [ ] Verify email and enable 2FA
- [ ] Generate automation access token
- [ ] Copy token for GitHub setup

### Phase 3: GitHub Repository Setup
- [ ] Add `DOCKERHUB_USERNAME` secret
- [ ] Add `DOCKERHUB_TOKEN` secret
- [ ] Add `NPM_TOKEN` secret
- [ ] Configure Actions permissions (Read and write)
- [ ] Set up branch protection rules for main/master
- [ ] Test workflow with a small change

### Phase 4: Validation
- [ ] Create test branch and make small change
- [ ] Open pull request to main/master
- [ ] Verify CI/CD pipeline runs tests
- [ ] Merge PR and verify Docker image is pushed
- [ ] Check Docker Hub for new image
- [ ] Verify NPM package is published (for releases)

## 🔍 Troubleshooting

### Common Issues

#### 1. Docker Hub Authentication Failed
```
Error: buildx failed with: ERROR: failed to solve: failed to authorize: authentication required
```

**Solutions**:
- Verify `DOCKERHUB_USERNAME` is exactly your Docker Hub username
- Regenerate `DOCKERHUB_TOKEN` with Read/Write/Delete permissions
- Check token hasn't expired
- Ensure Docker Hub repository exists and is accessible

#### 2. NPM Publishing Failed
```
Error: 401 Unauthorized - authentication required
```

**Solutions**:
- Verify `NPM_TOKEN` is an **Automation** token (not Classic)
- Check token hasn't expired (tokens expire after 1 year)
- Verify NPM account has publishing permissions
- Check package name isn't already taken or you have permission

#### 3. GitHub Token Permissions
```
Error: Resource not accessible by integration
```

**Solutions**:
- Enable "Read and write permissions" in Actions settings
- Add necessary permissions to workflow file:
  ```yaml
  permissions:
    contents: write
    packages: write
    id-token: write
  ```

#### 4. Branch Protection Blocking
```
Error: Required status check is failing
```

**Solutions**:
- Ensure all required checks are passing
- Verify branch protection rules are correctly configured
- Check if status check names match workflow job names

### Testing Secrets Locally

#### Test Docker Hub Connection
```bash
# Test authentication
echo "$DOCKERHUB_TOKEN" | docker login docker.io -u "$DOCKERHUB_USERNAME" --password-stdin

# Test push (after building image)
docker build -t nuxt-fullstack-mcp:test .
docker tag nuxt-fullstack-mcp:test your-username/nuxt-fullstack-mcp:test
docker push your-username/nuxt-fullstack-mcp:test
```

#### Test NPM Connection
```bash
# Test authentication
npm login --registry https://registry.npmjs.org/

# Test package info
npm view nuxt-mcp
```

## 🚀 Workflow Behavior

### On Pull Request
1. ✅ Run tests (lint, typecheck, unit tests, integration tests)
2. 🐳 Build Docker image locally (no push)
3. 🧪 Test Docker container
4. ❌ Skip Docker Hub push
5. ❌ Skip NPM publish

### On Push to main/master
1. ✅ Run tests (lint, typecheck, unit tests, integration tests)
2. 🐳 Build Docker image multi-platform
3. 📦 Push to Docker Hub with `latest` tag
4. 🧪 Test pushed Docker container
5. ❌ Skip NPM publish (only on tags)

### On Push to develop
1. ✅ Run tests
2. 🐳 Build and push Docker image with `dev` tag
3. ❌ Skip NPM publish

### On Git Tag (v*)
1. ✅ Run tests
2. 📦 Publish to NPM
3. 🐳 Build and push Docker image with version tag
4. 📝 Create GitHub release with changelog

## 🔐 Security Best Practices

### Secrets Management
- ✅ Use repository secrets, never commit tokens
- ✅ Use minimal required permissions for tokens
- ✅ Regularly rotate access tokens (annually)
- ✅ Use automation tokens for NPM (not personal tokens)
- ✅ Enable 2FA on all accounts (GitHub, NPM, Docker Hub)

### Workflow Security
- ✅ Pin action versions (e.g., `@v4` not `@main`)
- ✅ Use official GitHub actions when possible
- ✅ Review third-party actions before use
- ✅ Enable branch protection rules
- ✅ Require PR reviews for main/master

### Access Control
- ✅ Limit who can manage repository secrets
- ✅ Use environment protection rules for production
- ✅ Enable audit logging for secret access
- ✅ Regular security audits of permissions

---

**Need Help?** 
- Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- Review [Docker Hub documentation](https://docs.docker.com/docker-hub/)
- Consult [NPM documentation](https://docs.npmjs.com/)
- Open an issue in this repository for specific problems