-- Add academic CV columns to cvs table
ALTER TABLE `cvs` ADD COLUMN `layout_mode` text DEFAULT 'grouped';
--> statement-breakpoint
ALTER TABLE `cvs` ADD COLUMN `cv_mode` text DEFAULT 'industry';
--> statement-breakpoint
-- Add academic profile columns to settings table
ALTER TABLE `settings` ADD COLUMN `orcid` text DEFAULT '';
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `pronouns` text DEFAULT '';
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `academic_title` text DEFAULT '';
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `department` text DEFAULT '';
--> statement-breakpoint
ALTER TABLE `settings` ADD COLUMN `institution` text DEFAULT '';
