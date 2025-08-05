# Nuxt Fullstack MCP

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

> **Advanced MCP (Model Context Protocol) integration for Nuxt applications with comprehensive fullstack development and UI/UX design capabilities.**

Transform your Nuxt development workflow with AI-powered assistance that understands your entire stack - from database schema to UI components, authentication flows to design systems, and accessibility compliance to conversion optimization.

## 🚀 Features

### 🏗️ **Fullstack Development Assistant**
- **Nuxt UI Integration**: Component scaffolding, theme inspection, design system management
- **Authentication Flows**: Complete auth setup with Nuxt Auth Utils, OAuth providers, session management
- **Database Operations**: Drizzle ORM integration, schema inspection, query generation, API scaffolding
- **Runtime Inspection**: Live application analysis, component tree exploration, performance insights

### 🎨 **Professional UI/UX Design Expert**
- **Landing Page Optimization**: Conversion-focused page structures with SEO best practices
- **Dashboard UX Patterns**: Information architecture for complex data interfaces
- **Accessibility Compliance**: WCAG 2.1/2.2 auditing and inclusive design guidance
- **Design System Creation**: Complete token management and component library development
- **Color Psychology**: Accessible palettes with cultural and psychological considerations
- **User Flow Analysis**: Conversion optimization and friction reduction strategies

### 🛠️ **Developer Experience**
- **Smart Module Detection**: Automatically enables features based on installed packages
- **TypeScript First**: Full type safety across the entire stack
- **Real-time MCP Server**: Live context sharing at `http://localhost:3000/__mcp/sse`
- **IDE Integration**: Automatic configuration for VSCode, Cursor, Windsurf, and Claude Code

## 📦 What's Included

This monorepo contains:

- **[`nuxt-mcp`](./packages/nuxt-mcp)** - Enhanced Nuxt module with fullstack and UI/UX capabilities
- **[`vite-plugin-mcp`](./packages/vite-plugin-mcp)** - Base Vite plugin for MCP support

## 🏁 Quick Start

### Installation

```bash
# Add to your Nuxt project
npx nuxi@latest module add nuxt-mcp

# Or install manually
npm install nuxt-mcp
```

### Basic Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-mcp'],
  mcp: {
    // Optional: Include Nuxt docs MCP server
    includeNuxtDocsMcp: true,
    // Optional: Custom MCP server setup
    mcpServerSetup: async (mcp, vite) => {
      // Your custom tools and prompts
    }
  }
})
```

### Enhanced Setup (Recommended)

For the full fullstack experience, install these optional dependencies:

```bash
# UI Components & Design System
npm install @nuxt/ui

# Authentication
npm install nuxt-auth-utils

# Database ORM
npm install drizzle-orm @libsql/client
```

The MCP system will automatically detect these modules and enable relevant tools.

## 🎯 Usage

### Development Mode

Start your Nuxt application in development mode:

```bash
npm run dev
```

The MCP server will be available at: `http://localhost:3000/__mcp/sse`

### Using with Claude Code

1. **Automatic Setup**: When you run `npm run dev`, the module automatically updates your IDE configuration
2. **Manual Connection**: Connect Claude Code to `http://localhost:3000/__mcp/sse`
3. **Access Tools**: Use any of the 20+ available tools for development assistance

### Available Tools

#### 🏗️ **Core Development Tools**
```bash
# Runtime inspection
get-nuxt-runtime-info     # Application configuration and status
scaffold-nuxt-page        # Generate new pages with proper structure
scaffold-nuxt-component   # Create components with best practices
```

#### 🎨 **UI/UX Design Tools**
```bash
# Landing page optimization
generate-landing-page-structure  # Conversion-optimized page layouts

# Dashboard design
design-dashboard-layout         # User-centric dashboard patterns

# Accessibility compliance
audit-accessibility-wcag       # Complete WCAG 2.1/2.2 auditing
check-color-contrast          # Color accessibility validation

# Design systems
create-design-system          # Complete design system generation
generate-design-tokens        # Token management for design consistency
```

#### 🔐 **Authentication Tools** (when `nuxt-auth-utils` is installed)
```bash
scaffold-auth-pages          # Complete auth page generation
generate-auth-middleware     # Protected route middleware
list-auth-providers         # Available OAuth providers setup
```

#### 🗄️ **Database Tools** (when Drizzle ORM is detected)
```bash
get-database-schema         # Schema inspection and analysis
generate-drizzle-query      # Type-safe query generation
scaffold-database-api       # Complete CRUD API creation
```

### Expert Prompts

Access specialized AI expertise through these prompts:

- **`design-expert`**: Senior UI/UX designer with 10+ years experience
- **`landing-page-expert`**: Conversion rate optimization specialist
- **`dashboard-ux-expert`**: Dashboard and data interface specialist
- **`accessibility-expert`**: WCAG compliance and inclusive design expert
- **`fullstack-patterns`**: Integration guidance for all technologies

## 🏗️ Architecture

### Smart Module Detection

The system automatically detects your project setup:

- **Nuxt UI**: `@nuxt/ui` → Enables component tools and design system features
- **Auth Utils**: `nuxt-auth-utils` → Enables authentication flow tools
- **Drizzle ORM**: Database modules or env vars → Enables database tools
- **UI/UX Needs**: Always enabled → Professional design assistance available

### TypeScript Integration

Full type safety across the stack:

```typescript
// Database schema types flow to API responses
const users = await useDrizzleQuery('users', { 
  where: { active: true }
})

// Component props are fully typed
<UButton 
  variant="primary" 
  size="lg" 
  :loading="isSubmitting"
>
  Submit Form
</UButton>
```

### MCP Context Sharing

The MCP server provides real-time context about:

- Application configuration and runtime state  
- Installed modules and available features
- Database schema and relationships
- UI component library and theme tokens
- Authentication configuration and providers
- Performance metrics and optimization opportunities

## 🎨 Design Capabilities

### Landing Page Optimization

Generate conversion-focused landing pages:

```typescript
// Generated structure includes:
// - Hero section with compelling headlines
// - Problem/solution framework
// - Social proof integration
// - Conversion-optimized CTAs
// - SEO-friendly structure
// - Mobile-first responsive design
```

### Dashboard UX Patterns

Create productive admin interfaces:

```typescript
// Optimized for:
// - Information hierarchy
// - Role-based layouts
// - Data visualization best practices
// - Keyboard navigation
// - Mobile responsiveness
// - Performance at scale
```

### Accessibility Compliance

Built-in WCAG 2.1/2.2 compliance:

```typescript
// Automated checking for:
// - Color contrast ratios (4.5:1 AA, 7:1 AAA)
// - Keyboard navigation patterns
// - Screen reader compatibility
// - ARIA labeling strategies
// - Focus management
// - Semantic HTML structure
```

## 🔧 Configuration

### Advanced Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-mcp'],
  mcp: {
    // MCP server port (defaults to Nuxt dev server port)
    port: 3000,
    
    // Include official Nuxt docs MCP
    includeNuxtDocsMcp: true,
    
    // Custom MCP server setup
    mcpServerSetup: async (mcp, vite) => {
      // Add custom tools
      mcp.tool('my-custom-tool', 'Description', schema, handler)
      
      // Add custom prompts  
      mcp.prompt('my-expert', 'Custom expertise', promptHandler)
    },
    
    // Additional MCP servers
    updateConfigAdditionalServers: [
      {
        name: 'my-custom-server',
        url: 'http://localhost:8080/mcp'
      }
    ]
  }
})
```

### Environment Variables

```bash
# Database configuration (auto-detected)
DATABASE_URL=sqlite:./data.db
DATABASE_AUTH_TOKEN=your-token

# Authentication providers (auto-detected)
NUXT_OAUTH_GITHUB_CLIENT_ID=your-client-id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-secret
```

## 🔍 Development Workflow

### Recommended Development Process

1. **Plan with AI**: Use design expert prompts to plan UX and information architecture
2. **Generate Structure**: Use scaffolding tools to create pages, components, and APIs
3. **Implement Features**: Leverage fullstack tools for rapid development
4. **Ensure Accessibility**: Use WCAG audit tools throughout development
5. **Optimize Performance**: Apply design system and performance best practices

### Testing Integration

```bash
# Run the integration test suite
npm run test

# Test MCP integration specifically
npm run test:integration
```

## 📖 Examples

### Complete Feature Development

```typescript
// 1. Design the user flow
// Use: evaluate-user-flow tool

// 2. Create the database schema
// Use: scaffold-database-api with user management

// 3. Set up authentication
// Use: scaffold-auth-pages with OAuth providers

// 4. Build the UI components
// Use: nuxt-ui-scaffold with design system tokens

// 5. Ensure accessibility
// Use: audit-accessibility-wcag for compliance

// 6. Optimize for conversion
// Use: generate-landing-page-structure for marketing pages
```

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs/) directory:

- **[📖 Documentation Index](./docs/README.md)** - Complete guide to all documentation
- **[🚀 Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment and Docker setup
- **[🔧 GitHub Environment Setup](./docs/GITHUB_ENVIRONMENT_SETUP.md)** - CI/CD secrets and configuration
- **[🔄 CI/CD Pipeline](./docs/CI_CD_PIPELINE.md)** - Automated testing and deployment workflows

## 🤝 Contributing

This project is built upon the excellent foundation of [Anthony Fu's nuxt-mcp](https://github.com/antfu/nuxt-mcp). We've extended it with comprehensive fullstack development and professional UI/UX design capabilities.

## 📄 License

[MIT](./LICENSE) License [Dimitri Derthe](https://github.com/dimitriderthe)

---

**Acknowledgments**: This project extends the original `nuxt-mcp` by [Anthony Fu](https://github.com/antfu) with enhanced fullstack development and UI/UX design capabilities.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/nuxt-mcp
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669  
[npm-downloads-href]: https://npmjs.com/package/nuxt-mcp
[bundle-src]: https://img.shields.io/bundlephobia/minzip/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=nuxt-mcp
[license-src]: https://img.shields.io/github/license/antfu/nuxt-mcp.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/nuxt-mcp/blob/main/LICENSE