CREATE TABLE `kanban_card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kanban_board_id` integer NOT NULL,
	`kanban_column_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`kanban_board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kanban_column_id`) REFERENCES `kanban_column`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kanban_column` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kanban_board_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`kanban_board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE no action
);
