import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ============ SETTINGS (Single row for personal info) ============
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().default('default'),
  name: text('name').notNull().default(''),
  email: text('email').default(''),
  phone: text('phone').default(''),
  location: text('location').default(''),
  summary: text('summary').default(''),
  linkedIn: text('linked_in').default(''),
  github: text('github').default(''),
  website: text('website').default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ============ BRICKS (Structured data + optional markdown) ============
export const bricks = sqliteTable('bricks', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['experience', 'education', 'project', 'skill', 'publication', 'custom'] }).notNull(),
  title: text('title').notNull(),
  // Markdown content - for custom type or generated display
  content: text('content').default(''),
  // Tags for filtering and AI matching
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  // Frontmatter for quick metadata access (derived from structuredData)
  frontmatter: text('frontmatter', { mode: 'json' }).$type<{
    subtitle?: string
    location?: string
    startDate?: string
    endDate?: string
    url?: string
    company?: string
    role?: string
    [key: string]: unknown
  }>().default({}),
  // NEW: Structured data - type-specific fields stored as JSON
  structuredData: text('structured_data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ============ CVs (Saved Configurations) ============
export const cvs = sqliteTable('cvs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(true),
  targetRole: text('target_role'),
  targetCompany: text('target_company'),
  jobDescription: text('job_description'),
  templateId: text('template_id').default('default'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ============ CV-BRICK JUNCTION ============
export const cvBricks = sqliteTable('cv_bricks', {
  id: text('id').primaryKey(),
  cvId: text('cv_id').notNull().references(() => cvs.id, { onDelete: 'cascade' }),
  brickId: text('brick_id').notNull().references(() => bricks.id, { onDelete: 'cascade' }),
  sectionOrder: integer('section_order').notNull(),
  // Custom overrides for this CV
  customContent: text('custom_content'),
  isHighlighted: integer('is_highlighted', { mode: 'boolean' }).default(false)
})

// ============ RELATIONS ============
export const bricksRelations = relations(bricks, ({ many }) => ({
  cvBricks: many(cvBricks)
}))

export const cvsRelations = relations(cvs, ({ many }) => ({
  cvBricks: many(cvBricks)
}))

export const cvBricksRelations = relations(cvBricks, ({ one }) => ({
  cv: one(cvs, { fields: [cvBricks.cvId], references: [cvs.id] }),
  brick: one(bricks, { fields: [cvBricks.brickId], references: [bricks.id] })
}))

// ============ TYPE EXPORTS ============
export type Settings = typeof settings.$inferSelect
export type NewSettings = typeof settings.$inferInsert

export type Brick = typeof bricks.$inferSelect
export type NewBrick = typeof bricks.$inferInsert
export type BrickFrontmatter = NonNullable<Brick['frontmatter']>

export type CV = typeof cvs.$inferSelect
export type NewCV = typeof cvs.$inferInsert

export type CVBrick = typeof cvBricks.$inferSelect
export type NewCVBrick = typeof cvBricks.$inferInsert
