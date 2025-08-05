# Documentation Index

Welcome to the Nuxt Fullstack MCP documentation. This directory contains comprehensive guides for deployment, CI/CD setup, and GitHub environment configuration.

## 📚 Available Documentation

### 🚀 [Deployment Guide](./DEPLOYMENT.md)
Complete deployment guide covering all methods for running Nuxt Fullstack MCP in production.

**Topics covered**:
- Docker containerization and orchestration
- NPM package installation and usage
- Production deployment strategies
- Cloud platform deployment (AWS, GCP, Azure)
- Performance optimization and monitoring
- Troubleshooting common issues

### 🔧 [GitHub Environment Setup](./GITHUB_ENVIRONMENT_SETUP.md)
Step-by-step guide for configuring GitHub repository secrets and environment variables.

**Topics covered**:
- Required secrets (NPM_TOKEN, DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
- GitHub Actions permissions configuration
- Branch protection rules setup
- Security best practices
- Troubleshooting authentication issues

### 🔄 [CI/CD Pipeline](./CI_CD_PIPELINE.md)
Detailed documentation of the automated CI/CD pipeline for testing, building, and deploying.

**Topics covered**:
- Workflow triggers and conditions
- Docker build and push automation
- NPM publishing process
- Release management workflow
- Pipeline monitoring and debugging
- Security measures and best practices

## 🏃‍♂️ Quick Start

### For Developers
1. Read the [Main README](../README.md) for project overview
2. Follow [Deployment Guide](./DEPLOYMENT.md) for local setup
3. Configure [GitHub Environment](./GITHUB_ENVIRONMENT_SETUP.md) for CI/CD

### For DevOps/Infrastructure
1. Review [CI/CD Pipeline](./CI_CD_PIPELINE.md) for automation details
2. Follow [GitHub Environment Setup](./GITHUB_ENVIRONMENT_SETUP.md) for secrets
3. Use [Deployment Guide](./DEPLOYMENT.md) for production deployment

### For Contributors
1. Start with the [Main README](../README.md)
2. Set up local development per [Deployment Guide](./DEPLOYMENT.md)
3. Understand the [CI/CD Pipeline](./CI_CD_PIPELINE.md) for PR process

## 📖 Related Files

### Core Documentation
- [`../README.md`](../README.md) - Project overview and features
- [`../CHANGELOG.md`](../CHANGELOG.md) - Version history and changes
- [`../CLAUDE.md`](../CLAUDE.md) - AI assistant context and capabilities

### Configuration Files
- [`../package.json`](../package.json) - Project dependencies and scripts
- [`../docker-compose.yml`](../docker-compose.yml) - Local development stack
- [`../Dockerfile`](../Dockerfile) - Production container definition

### Scripts
- [`../scripts/release.sh`](../scripts/release.sh) - Automated release process
- [`../scripts/docker-push.sh`](../scripts/docker-push.sh) - Docker deployment

## 🆘 Getting Help

### Common Issues
1. **Docker Build Failures** → See [Deployment Guide - Troubleshooting](./DEPLOYMENT.md#troubleshooting)
2. **GitHub Actions Errors** → See [CI/CD Pipeline - Troubleshooting](./CI_CD_PIPELINE.md#troubleshooting)
3. **Authentication Issues** → See [GitHub Environment Setup - Troubleshooting](./GITHUB_ENVIRONMENT_SETUP.md#troubleshooting)

### Support Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support
- **Documentation**: Check all docs before asking questions

### Contributing to Docs
1. Documentation follows markdown standards
2. Include code examples and screenshots where helpful
3. Keep language clear and concise
4. Update the index when adding new docs

---

**Note**: This documentation is actively maintained. Last updated with version 2.0.0 including comprehensive UI/UX design capabilities and Docker containerization.