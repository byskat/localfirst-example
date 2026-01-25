import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

export * from "./auth-schema";

import { users } from "./auth-schema";

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const projectsTable = pgTable(`projects`, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  shared_user_ids: text(`shared_user_ids`).array().notNull().default([]),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  owner_id: text(`owner_id`)
    .notNull()
    .references(() => users.id, { onDelete: `cascade` }),
});

export const todosTable = pgTable(`todos`, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  text: varchar({ length: 500 }).notNull(),
  completed: boolean().notNull().default(false),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  user_id: text(`user_id`)
    .notNull()
    .references(() => users.id, { onDelete: `cascade` }),
  project_id: integer(`project_id`)
    .notNull()
    .references(() => projectsTable.id, { onDelete: `cascade` }),
  user_ids: text(`user_ids`).array().notNull().default([]),
});

export const dashboardsTable = pgTable(`dashboards`, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  shared_user_ids: text(`shared_user_ids`).array().notNull().default([]),
  editor_ids: text(`editor_ids`).array().notNull().default([]),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  owner_id: text(`owner_id`)
    .notNull()
    .references(() => users.id, { onDelete: `cascade` }),
});

export const widgetTypeEnum = z.enum([`chart`, `table`]);

export const dashboardWidgetsTable = pgTable(`dashboard_widgets`, {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  dashboard_id: integer(`dashboard_id`)
    .notNull()
    .references(() => dashboardsTable.id, { onDelete: `cascade` }),
  type: varchar({ length: 50 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  config: jsonb().notNull().default({}),
  layout: jsonb().notNull(),
  data_source: jsonb().notNull().default({}),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const selectProjectSchema = createSelectSchema(projectsTable);
export const createProjectSchema = createInsertSchema(projectsTable).omit({
  created_at: true,
});
export const updateProjectSchema = createUpdateSchema(projectsTable);

export const selectTodoSchema = createSelectSchema(todosTable);
export const createTodoSchema = createInsertSchema(todosTable).omit({
  created_at: true,
});
export const updateTodoSchema = createUpdateSchema(todosTable);

export const selectDashboardSchema = createSelectSchema(dashboardsTable);
export const createDashboardSchema = createInsertSchema(dashboardsTable).omit({
  created_at: true,
});
export const updateDashboardSchema = createUpdateSchema(dashboardsTable);

const widgetLayoutItemSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  maxW: z.number().optional(),
  minH: z.number().optional(),
  maxH: z.number().optional(),
  static: z.boolean().optional(),
});

const widgetLayoutSchema = z.object({
  mobile: widgetLayoutItemSchema,
  tablet: widgetLayoutItemSchema,
  desktop: widgetLayoutItemSchema,
});

export const selectWidgetSchema = createSelectSchema(dashboardWidgetsTable, {
  config: z.any(),
  layout: widgetLayoutSchema,
  data_source: z.any(),
});
export const createWidgetSchema = createInsertSchema(dashboardWidgetsTable, {
  config: z.any(),
  layout: widgetLayoutSchema,
  data_source: z.any(),
}).omit({
  created_at: true,
});
export const updateWidgetSchema = createUpdateSchema(dashboardWidgetsTable, {
  config: z.any().optional(),
  layout: widgetLayoutSchema.optional(),
  data_source: z.any().optional(),
});

export type Project = z.infer<typeof selectProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Todo = z.infer<typeof selectTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type Dashboard = z.infer<typeof selectDashboardSchema>;
export type UpdateDashboard = z.infer<typeof updateDashboardSchema>;
export type Widget = z.infer<typeof selectWidgetSchema>;
export type WidgetType = z.infer<typeof widgetTypeEnum>;
export type WidgetLayout = z.infer<typeof widgetLayoutSchema>;

export const selectUsersSchema = createSelectSchema(users);
