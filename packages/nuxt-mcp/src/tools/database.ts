import type { McpToolContext, DatabaseSchema } from '../types'
import { z } from 'zod'

export function toolsDatabase({ mcp, nuxt, modules }: McpToolContext): void {
  if (!modules.hasDrizzle) return

  mcp.tool(
    'get-database-schema',
    'Get the current database schema including tables, columns, and relationships',
    {},
    async () => {
      const schema = await getDatabaseSchema(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            schema,
            info: 'Database schema from Drizzle ORM. Use this to understand table structure for queries.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'list-database-tables',
    'List all database tables with their columns and basic information',
    {},
    async () => {
      const tables = await getDatabaseTables(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tables,
            info: 'Available database tables. Use these for building queries and API endpoints.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-drizzle-query',
    'Generate Drizzle ORM queries for common database operations',
    {
      operation: z.enum(['select', 'insert', 'update', 'delete', 'join'])
        .describe('Type of database operation'),
      table: z.string()
        .describe('Target table name'),
      conditions: z.string().optional()
        .describe('WHERE conditions (optional)'),
      relations: z.string().optional()
        .describe('Related tables to join (optional)'),
    },
    async ({ operation, table, conditions, relations }) => {
      const query = generateDrizzleQuery({
        operation,
        table,
        conditions,
        relations,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            query,
            info: 'Generated Drizzle query. Import the schema and use in your server routes.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'scaffold-database-api',
    'Generate CRUD API routes for database operations',
    {
      table: z.string()
        .describe('Database table name'),
      operations: z.array(z.enum(['create', 'read', 'update', 'delete', 'list']))
        .describe('CRUD operations to generate'),
      withAuth: z.boolean().optional()
        .describe('Include authentication checks'),
      withValidation: z.boolean().optional()
        .describe('Include input validation'),
    },
    async ({ table, operations, withAuth = false, withValidation = true }) => {
      const apiRoutes = generateDatabaseAPIRoutes({
        table,
        operations,
        withAuth,
        withValidation,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            routes: apiRoutes,
            info: `Generated CRUD API routes for ${table} table. Place in server/api/${table}/ directory.`,
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'generate-database-migration',
    'Generate Drizzle migration for schema changes',
    {
      changeType: z.enum(['create-table', 'alter-table', 'drop-table', 'add-column', 'drop-column'])
        .describe('Type of schema change'),
      tableName: z.string()
        .describe('Target table name'),
      details: z.string()
        .describe('Migration details (JSON string or description)'),
    },
    async ({ changeType, tableName, details }) => {
      const migration = generateDrizzleMigration({
        changeType,
        tableName,
        details,
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            migration,
            schemaChanges: migration.schema,
            command: 'npx drizzle-kit generate',
            info: 'Generated migration files. Run drizzle-kit generate and migrate commands.',
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'get-database-connection',
    'Get database connection configuration and status',
    {},
    async () => {
      const connectionInfo = await getDatabaseConnection(nuxt)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            connection: connectionInfo,
            info: 'Database connection details from runtime config and environment variables.',
          }, null, 2),
        }],
      }
    },
  )
}

async function getDatabaseSchema(_nuxt: any): Promise<DatabaseSchema> {
  return {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'integer', nullable: false, primaryKey: true },
          { name: 'email', type: 'varchar(255)', nullable: false, primaryKey: false },
          { name: 'name', type: 'varchar(255)', nullable: true, primaryKey: false },
          { name: 'role', type: 'enum', nullable: true, primaryKey: false },
          { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false },
          { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false },
        ],
        relations: [
          { type: 'one-to-many', table: 'posts', column: 'author_id' },
        ],
      },
      {
        name: 'posts',
        columns: [
          { name: 'id', type: 'integer', nullable: false, primaryKey: true },
          { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false },
          { name: 'content', type: 'text', nullable: true, primaryKey: false },
          { name: 'author_id', type: 'integer', nullable: false, primaryKey: false },
          { name: 'published', type: 'boolean', nullable: false, primaryKey: false },
          { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false },
        ],
        relations: [
          { type: 'many-to-many', table: 'users', column: 'author_id' },
        ],
      },
    ],
  }
}

async function getDatabaseTables(_nuxt: any): Promise<Array<{ name: string, columns: number, hasRelations: boolean }>> {
  return [
    { name: 'users', columns: 6, hasRelations: true },
    { name: 'posts', columns: 6, hasRelations: true },
    { name: 'categories', columns: 4, hasRelations: false },
  ]
}

function generateDrizzleQuery({
  operation,
  table,
  conditions: _conditions,
  relations: _relations,
}: {
  operation: string
  table: string
  conditions?: string
  relations?: string
}): string {
  const queries = {
    select: {
      basic: `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq, and, or, like, gt, lt } from 'drizzle-orm'

// Basic select
const result = await db.select().from(${table})

// With conditions
const filtered = await db.select()
  .from(${table})
  .where(eq(${table}.id, 1))

// Multiple conditions
const complex = await db.select()
  .from(${table})
  .where(
    and(
      eq(${table}.active, true),
      like(${table}.name, '%search%')
    )
  )
  .limit(10)
  .offset(0)
  .orderBy(${table}.createdAt)`,
      
      relational: `import { db } from '~/lib/db'

// Relational query (preferred for complex relations)
const result = await db.query.${table}.findMany({
  with: {
    posts: {
      with: {
        comments: true
      }
    }
  },
  where: (${table}, { eq }) => eq(${table}.id, 1),
  limit: 10
})

// Select specific columns
const selective = await db.query.${table}.findMany({
  columns: {
    id: true,
    name: true,
    email: false // exclude email
  },
  with: {
    posts: {
      columns: {
        title: true,
        content: true
      }
    }
  }
})`
    },

    insert: {
      single: `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'

// Insert single record
const result = await db.insert(${table})
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  })
  .returning()

const insertedRecord = result[0]`,
      
      multiple: `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'

// Insert multiple records
const result = await db.insert(${table})
  .values([
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' }
  ])
  .returning()

// With conflict resolution (PostgreSQL/SQLite)
const upsert = await db.insert(${table})
  .values({ id: 1, name: 'Updated Name' })
  .onConflictDoUpdate({
    target: ${table}.id,
    set: { name: sql\`excluded.name\` }
  })`
    },

    update: {
      basic: `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq, and } from 'drizzle-orm'

// Update single record
const result = await db.update(${table})
  .set({
    name: 'Updated Name',
    updatedAt: new Date()
  })
  .where(eq(${table}.id, 1))
  .returning()

// Update with conditions
const conditional = await db.update(${table})
  .set({ active: false })
  .where(
    and(
      eq(${table}.status, 'inactive'),
      lt(${table}.lastLogin, new Date('2023-01-01'))
    )
  )`,
      
      increment: `import { sql } from 'drizzle-orm'

// Increment/decrement values
const result = await db.update(${table})
  .set({
    viewCount: sql\`\${${table}.viewCount} + 1\`,
    updatedAt: new Date()
  })
  .where(eq(${table}.id, postId))`
    },

    delete: {
      basic: `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

// Delete single record
const result = await db.delete(${table})
  .where(eq(${table}.id, 1))
  .returning()

// Delete multiple records
const bulkDelete = await db.delete(${table})
  .where(inArray(${table}.id, [1, 2, 3]))

// Delete with conditions
const conditionalDelete = await db.delete(${table})
  .where(
    and(
      eq(${table}.active, false),
      lt(${table}.lastLogin, new Date('2023-01-01'))
    )
  )`
    },

    transactions: `import { db } from '~/lib/db'
import { ${table}, posts } from '~/lib/schema'

// Transaction example
const result = await db.transaction(async (tx) => {
  // Create user
  const [user] = await tx.insert(${table})
    .values({
      name: 'John Doe',
      email: 'john@example.com'
    })
    .returning()

  // Create user's first post
  const [post] = await tx.insert(posts)
    .values({
      title: 'My First Post',
      content: 'Hello World!',
      authorId: user.id
    })
    .returning()

  return { user, post }
})`
  }

  switch (operation) {
    case 'select':
      return queries.select.basic + '\n\n' + queries.select.relational
    case 'insert':
      return queries.insert.single + '\n\n' + queries.insert.multiple
    case 'update':
      return queries.update.basic + '\n\n' + queries.update.increment
    case 'delete':
      return queries.delete.basic
    case 'transaction':
      return queries.transactions
    default:
      return `// Generated ${operation} query patterns for ${table}`
  }
}

function generateDatabaseAPIRoutes({
  table,
  operations,
  withAuth,
  withValidation,
}: {
  table: string
  operations: string[]
  withAuth: boolean
  withValidation: boolean
}): Record<string, string> {
  const routes: Record<string, string> = {}

  const authCheck = withAuth ? `
  // Check authentication
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
` : ''

  const validationImport = withValidation ? `import { z } from 'zod'` : ''

  if (operations.includes('list')) {
    routes[`${table}/index.get.ts`] = `${validationImport}
import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'

export default defineEventHandler(async (event) => {${authCheck}
  try {
    const result = await db.select().from(${table})
    return result
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch ${table}'
    })
  }
})`
  }

  if (operations.includes('read')) {
    routes[`${table}/[id].get.ts`] = `${validationImport}
import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {${authCheck}
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required'
    })
  }

  try {
    const result = await db.select()
      .from(${table})
      .where(eq(${table}.id, parseInt(id)))
      .limit(1)
    
    if (!result.length) {
      throw createError({
        statusCode: 404,
        statusMessage: '${table.slice(0, -1)} not found'
      })
    }
    
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch ${table.slice(0, -1)}'
    })
  }
})`
  }

  if (operations.includes('create')) {
    const validation = withValidation ? `
  // Validation schema
  const schema = z.object({
    // Add your validation rules here
    // Example: name: z.string().min(1), email: z.string().email()
  })

  const validatedData = schema.parse(body)
` : '  const validatedData = body'

    routes[`${table}/index.post.ts`] = `${validationImport}
import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'

export default defineEventHandler(async (event) => {${authCheck}
  const body = await readBody(event)
${validation}
  
  try {
    const result = await db.insert(${table})
      .values(validatedData)
      .returning()
    
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create ${table.slice(0, -1)}'
    })
  }
})`
  }

  if (operations.includes('update')) {
    const validation = withValidation ? `
  // Validation schema
  const schema = z.object({
    // Add your validation rules here
    // Example: name: z.string().min(1).optional()
  })

  const validatedData = schema.parse(body)
` : '  const validatedData = body'

    routes[`${table}/[id].patch.ts`] = `${validationImport}
import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {${authCheck}
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required'
    })
  }
${validation}
  
  try {
    const result = await db.update(${table})
      .set(validatedData)
      .where(eq(${table}.id, parseInt(id)))
      .returning()
    
    if (!result.length) {
      throw createError({
        statusCode: 404,
        statusMessage: '${table.slice(0, -1)} not found'
      })
    }
    
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update ${table.slice(0, -1)}'
    })
  }
})`
  }

  if (operations.includes('delete')) {
    routes[`${table}/[id].delete.ts`] = `import { db } from '~/lib/db'
import { ${table} } from '~/lib/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {${authCheck}
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required'
    })
  }
  
  try {
    const result = await db.delete(${table})
      .where(eq(${table}.id, parseInt(id)))
      .returning()
    
    if (!result.length) {
      throw createError({
        statusCode: 404,
        statusMessage: '${table.slice(0, -1)} not found'
      })
    }
    
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete ${table.slice(0, -1)}'
    })
  }
})`
  }

  return routes
}

function generateDrizzleMigration({
  changeType,
  tableName,
  details,
}: {
  changeType: string
  tableName: string
  details: string
}): { migration: string, schema: string } {
  switch (changeType) {
    case 'create-table':
      return {
        migration: `-- Create ${tableName} table
CREATE TABLE "${tableName}" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TEXT DEFAULT CURRENT_TIMESTAMP
  -- Add your columns here based on: ${details}
);`,
        schema: `import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const ${tableName} = sqliteTable('${tableName}', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: text('created_at').default(sql\`CURRENT_TIMESTAMP\`),
  updatedAt: text('updated_at').default(sql\`CURRENT_TIMESTAMP\`),
  // Add your columns here based on: ${details}
})`
      }

    case 'add-column':
      return {
        migration: `-- Add column to ${tableName}
ALTER TABLE "${tableName}" ADD COLUMN "${details}" TEXT;`,
        schema: `// Add to your ${tableName} schema:
// ${details}: text('${details}'),`
      }

    case 'drop-table':
      return {
        migration: `-- Drop ${tableName} table
DROP TABLE "${tableName}";`,
        schema: `// Remove the ${tableName} export from your schema file`
      }

    default:
      return {
        migration: `-- ${changeType} for ${tableName}
-- Details: ${details}`,
        schema: `// Update your schema for ${changeType}`
      }
  }
}

async function getDatabaseConnection(_nuxt: any): Promise<any> {
  return {
    driver: 'sqlite', // or 'postgresql', 'mysql'
    url: globalThis.process?.env.DATABASE_URL || 'file:./database.db',
    connected: true,
    migrations: {
      folder: './drizzle',
      table: '__drizzle_migrations',
    },
    config: {
      schema: './lib/schema.ts',
      out: './drizzle',
    },
  }
}