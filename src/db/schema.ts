import { 
  mysqlTable, 
  text, 
  varchar,
  timestamp, 
  date,
  primaryKey,
  index
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// users テーブル
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image: text('image'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// projects テーブル
export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
}));

// projects_users テーブル（中間テーブル）
export const projectsUsers = mysqlTable('projects_users', {
  user_id: varchar('user_id', { length: 255 }).notNull(),
  project_id: varchar('project_id', { length: 255 }).notNull(),
  role: text('role', { enum: ['editor', 'viewer'] }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.user_id, table.project_id] }),
  userIdx: index('user_idx').on(table.user_id),
  projectIdx: index('project_idx').on(table.project_id),
}));

// tasks テーブル
export const tasks = mysqlTable('tasks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  due_date: date('due_date'),
  project_id: varchar('project_id', { length: 255 }).notNull(),
  assignee_id: varchar('assignee_id', { length: 255 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  projectIdx: index('project_idx').on(table.project_id),
  assigneeIdx: index('assignee_idx').on(table.assignee_id),
  statusIdx: index('status_idx').on(table.status),
  dueDateIdx: index('due_date_idx').on(table.due_date),
}));

// comments テーブル
export const comments = mysqlTable('comments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  content: text('content').notNull(),
  task_id: varchar('task_id', { length: 255 }).notNull(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  taskIdx: index('task_idx').on(table.task_id),
  userIdx: index('user_idx').on(table.user_id),
  createdAtIdx: index('created_at_idx').on(table.created_at),
}));

// リレーション定義
export const usersRelations = relations(users, ({ many }) => ({
  projectsUsers: many(projectsUsers),
  assignedTasks: many(tasks),
  comments: many(comments),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectsUsers: many(projectsUsers),
  tasks: many(tasks),
}));

export const projectsUsersRelations = relations(projectsUsers, ({ one }) => ({
  user: one(users, {
    fields: [projectsUsers.user_id],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectsUsers.project_id],
    references: [projects.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignee_id],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.task_id],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
}));
