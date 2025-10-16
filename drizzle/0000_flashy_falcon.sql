CREATE TABLE `comments` (
	`id` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`task_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects_users` (
	`user_id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`role` text NOT NULL,
	CONSTRAINT `projects_users_user_id_project_id_pk` PRIMARY KEY(`user_id`,`project_id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` varchar(20) NOT NULL,
	`priority` varchar(20) NOT NULL,
	`due_date` date,
	`project_id` varchar(255) NOT NULL,
	`assignee_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` text,
	`email` varchar(255) NOT NULL,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `task_idx` ON `comments` (`task_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `comments` (`created_at`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `projects` (`name`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `projects_users` (`user_id`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `projects_users` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `assignee_idx` ON `tasks` (`assignee_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `due_date_idx` ON `tasks` (`due_date`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);