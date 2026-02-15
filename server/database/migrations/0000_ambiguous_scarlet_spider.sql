CREATE TABLE `bricks` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '',
	`tags` text DEFAULT '[]',
	`frontmatter` text DEFAULT '{}',
	`structured_data` text DEFAULT '{}',
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `cv_bricks` (
	`id` text PRIMARY KEY NOT NULL,
	`cv_id` text NOT NULL,
	`brick_id` text NOT NULL,
	`section_order` integer NOT NULL,
	`custom_content` text,
	`is_highlighted` integer DEFAULT false,
	FOREIGN KEY (`cv_id`) REFERENCES `cvs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`brick_id`) REFERENCES `bricks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cvs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`is_published` integer DEFAULT true,
	`target_role` text,
	`target_company` text,
	`job_description` text,
	`template_id` text DEFAULT 'default',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cvs_slug_unique` ON `cvs` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '',
	`phone` text DEFAULT '',
	`location` text DEFAULT '',
	`summary` text DEFAULT '',
	`linked_in` text DEFAULT '',
	`github` text DEFAULT '',
	`website` text DEFAULT '',
	`updated_at` integer
);
