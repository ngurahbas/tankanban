PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_kanban_board` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`columns_order` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_kanban_board`("id", "user_id", "name", "columns_order", "created_at", "updated_at") SELECT "id", "user_id", "name", "columns_order", "created_at", "updated_at" FROM `kanban_board`;--> statement-breakpoint
DROP TABLE `kanban_board`;--> statement-breakpoint
ALTER TABLE `__new_kanban_board` RENAME TO `kanban_board`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_kanban_card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`kanban_board_id` integer NOT NULL,
	`kanban_column_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kanban_board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kanban_column_id`) REFERENCES `kanban_column`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_kanban_card`("id", "user_id", "kanban_board_id", "kanban_column_id", "name", "description", "created_at", "updated_at") SELECT "id", "user_id", "kanban_board_id", "kanban_column_id", "name", "description", "created_at", "updated_at" FROM `kanban_card`;--> statement-breakpoint
DROP TABLE `kanban_card`;--> statement-breakpoint
ALTER TABLE `__new_kanban_card` RENAME TO `kanban_card`;--> statement-breakpoint
CREATE INDEX `kanban_card_board_id_idx` ON `kanban_card` (`kanban_board_id`);--> statement-breakpoint
CREATE INDEX `kanban_card_column_id_idx` ON `kanban_card` (`kanban_column_id`);--> statement-breakpoint
CREATE TABLE `__new_kanban_column` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`kanban_board_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `user_auth`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kanban_board_id`) REFERENCES `kanban_board`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_kanban_column`("id", "user_id", "kanban_board_id", "name", "created_at", "updated_at") SELECT "id", "user_id", "kanban_board_id", "name", "created_at", "updated_at" FROM `kanban_column`;--> statement-breakpoint
DROP TABLE `kanban_column`;--> statement-breakpoint
ALTER TABLE `__new_kanban_column` RENAME TO `kanban_column`;--> statement-breakpoint
CREATE INDEX `kanban_column_board_id_idx` ON `kanban_column` (`kanban_board_id`);