import type { McpToolContext } from '../types'

export function promptDatabase({ mcp, modules }: McpToolContext): void {
  if (!modules.hasDrizzle) return

  mcp.prompt('drizzle-patterns', () => {
    const lines: string[] = []

    lines.push(`
## Drizzle ORM - Complete Database Guide

This project uses Drizzle ORM (https://orm.drizzle.team) for type-safe database operations.

### Core Philosophy
- **SQL-Like**: Stays close to standard SQL syntax
- **Type-Safe**: Full TypeScript integration with compile-time checks
- **Performant**: Generates efficient single SQL statements
- **Headless**: Flexible integration without forcing project structure
- **Zero Dependencies**: Lightweight with no external runtime dependencies

### Setup & Configuration
\`\`\`bash
# Install Drizzle ORM and driver
npm i drizzle-orm
npm i -D drizzle-kit

# Database drivers (choose one)
npm i pg              # PostgreSQL
npm i mysql2          # MySQL
npm i @libsql/client  # SQLite
\`\`\`

\`\`\`typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 'mysql' | 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
\`\`\`

### Schema Definition Patterns
\`\`\`typescript
// lib/schema.ts
import { pgTable, integer, varchar, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Basic table with common patterns
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Table with foreign keys and constraints
export const posts = pgTable('posts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at'),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description')
})

// Define relationships for type-safe joins
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments)
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id]
  }),
  comments: many(comments)
}))

export const comments = pgTable('comments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
\`\`\`

### Database Connection
\`\`\`typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Connection pool for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool, { schema })

// For SQLite
// import { drizzle } from 'drizzle-orm/libsql'
// import { createClient } from '@libsql/client'
// const client = createClient({ url: process.env.DATABASE_URL })
// export const db = drizzle(client, { schema })
\`\`\`

### Query Patterns & Examples

#### Relational Queries (Preferred)
\`\`\`typescript
// server/api/posts/index.get.ts
import { db } from '~/lib/db'

export default defineEventHandler(async (event) => {
  // Get posts with author and category information
  const posts = await db.query.posts.findMany({
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          avatar: true
        }
      },
      category: true,
      comments: {
        with: {
          author: {
            columns: {
              name: true,
              avatar: true
            }
          }
        },
        limit: 5
      }
    },
    where: (posts, { eq }) => eq(posts.published, true),
    orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
    limit: 20
  })
  
  return posts
})

// Get single post with all relations
const post = await db.query.posts.findFirst({
  where: (posts, { eq }) => eq(posts.slug, 'my-post-slug'),
  with: {
    author: true,
    category: true,
    comments: {
      with: {
        author: true
      },
      orderBy: (comments, { desc }) => [desc(comments.createdAt)]
    }
  }
})
\`\`\`

#### SQL-Like Queries
\`\`\`typescript
import { db } from '~/lib/db'
import { posts, users, categories } from '~/lib/schema'
import { eq, and, or, like, gt, lt, desc, asc } from 'drizzle-orm'

// Basic CRUD operations
export default defineEventHandler(async (event) => {
  // SELECT with conditions
  const publishedPosts = await db.select({
    id: posts.id,
    title: posts.title,
    authorName: users.name,
    categoryName: categories.name
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .leftJoin(categories, eq(posts.categoryId, categories.id))
  .where(
    and(
      eq(posts.published, true),
      gt(posts.publishedAt, new Date('2024-01-01'))
    )
  )
  .orderBy(desc(posts.publishedAt))
  .limit(10)
  
  // INSERT with returning
  const [newPost] = await db.insert(posts)
    .values({
      title: 'New Post',
      slug: 'new-post',
      content: 'Post content...',
      authorId: userId,
      categoryId: 1
    })
    .returning()
  
  // UPDATE with conditions
  const [updatedPost] = await db.update(posts)
    .set({
      title: 'Updated Title',
      updatedAt: new Date()
    })
    .where(eq(posts.id, postId))
    .returning()
  
  // DELETE with cascade
  await db.delete(posts)
    .where(eq(posts.id, postId))
  
  return { publishedPosts, newPost, updatedPost }
})
\`\`\`

#### Advanced Query Patterns
\`\`\`typescript
// Complex search with multiple conditions
const searchPosts = await db.select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(
    and(
      eq(posts.published, true),
      or(
        like(posts.title, \`%\${searchTerm}%\`),
        like(posts.content, \`%\${searchTerm}%\`),
        like(users.name, \`%\${searchTerm}%\`)
      )
    )
  )
  .orderBy(desc(posts.publishedAt))
  .limit(20)
  .offset(offset)

// Aggregations and grouping
import { count, avg, sum } from 'drizzle-orm'

const postStats = await db.select({
  categoryId: posts.categoryId,
  categoryName: categories.name,
  postCount: count(posts.id),
  avgLength: avg(length(posts.content))
})
.from(posts)
.leftJoin(categories, eq(posts.categoryId, categories.id))
.where(eq(posts.published, true))
.groupBy(posts.categoryId, categories.name)
.orderBy(desc(count(posts.id)))
\`\`\`

### Transaction Management
\`\`\`typescript
// server/api/posts/create.post.ts
import { db } from '~/lib/db'
import { posts, users } from '~/lib/schema'

export default defineEventHandler(async (event) => {
  const { title, content, authorId } = await readBody(event)
  
  // Transaction ensures atomicity
  const result = await db.transaction(async (tx) => {
    // Create the post
    const [post] = await tx.insert(posts)
      .values({
        title,
        content,
        slug: generateSlug(title),
        authorId
      })
      .returning()
    
    // Update user's post count
    await tx.update(users)
      .set({
        postCount: sql\`\${users.postCount} + 1\`
      })
      .where(eq(users.id, authorId))
    
    // If any operation fails, entire transaction is rolled back
    return post
  })
  
  return result
})
\`\`\`

### Migration Management
\`\`\`bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push

# View current migration status
npx drizzle-kit up
\`\`\`

\`\`\`sql
-- Generated migration example (drizzle/0001_create_users.sql)
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "avatar" text,
  "email_verified" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
\`\`\`

### API Integration Patterns
\`\`\`typescript
// server/api/users/[id].get.ts - Get user with posts
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID required'
    })
  }
  
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        posts: {
          where: (posts, { eq }) => eq(posts.published, true),
          orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
          limit: 10
        }
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return user
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database error'
    })
  }
})
\`\`\`

### Performance Optimization
1. **Indexing**: Add indexes for frequently queried columns
2. **Connection Pooling**: Use connection pools in production
3. **Query Optimization**: Use \`select()\` with specific columns
4. **Pagination**: Always limit results and use offset/cursor pagination
5. **Prepared Statements**: Drizzle automatically uses prepared statements
6. **Batch Operations**: Use \`db.batch()\` for multiple operations

### Security Best Practices
1. **Input Validation**: Always validate data before database operations
2. **Authorization**: Check user permissions before queries
3. **SQL Injection**: Drizzle prevents SQL injection by design
4. **Environment Variables**: Store credentials securely
5. **Connection Security**: Use SSL/TLS for database connections
6. **Audit Logging**: Log database operations for security monitoring

### Type Safety & IntelliSense
\`\`\`typescript
// Inferred types from schema
type User = typeof users.$inferSelect
type NewUser = typeof users.$inferInsert
type Post = typeof posts.$inferSelect
type NewPost = typeof posts.$inferInsert

// Custom query functions with proper typing
async function getUserWithPosts(userId: string): Promise<User & { posts: Post[] }> {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      posts: true
    }
  })
}
\`\`\`
`)

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: lines.join('\n'),
          },
        },
      ],
    }
  })
}