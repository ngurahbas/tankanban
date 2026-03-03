# Database, UI Components, and Pages
## Database
This project uses  sqlite.
### Kanban Board
table name: kanban_board
fields: 
- id: primary key
- name
- columns_order: text, comma-separated column ids
- created_at
- updated_at
### Kanban Column
table name: kanban_column
fields: 
- id: primary key
- kanban_board_id: indexed, foreign key referencing kanban_board.id
- name
- created_at
- updated_at
### Kanban Card
table name: kanban_card
fields: 
- id: primary key
- kanban_board_id: indexed, foreign key referencing kanban_board.id
- kanban_column_id: indexed, foreign key referencing kanban_column.id
- name
- description: nullable
- created_at
- updated_at
## UI Components
### Main Panel
Main Panel component is placed on top for desktop and bottom for mobile. It contains:
- *Humburger menu button*
  - left side for desktop and right side for mobile
### Side Panel
Side Panel component is placed on the left side for desktop and right side for mobile. it contains:
- *List of kanban boards*
  - Links of each kanban board (/kanban/{kanban_id})
- *Add Kanban Board button* 
  - behaviour: when clicked *Add New Board Form* is shown and this button is hidden.
  - text: "Add"
- *Add Kanban New Board Form*
  - New Kanban Board Name field
  - Submit button
  - Cancel button
### Kanban Board View
- *Kanban Board Title*
  - Editable title field
- *Kanban Columns*
  - Drag-and-drop reordering of columns
  - Add Column button
  - Add Card button to show a form for adding a new card
- *Kanban Cards*
  - Drag-and-drop reordering of cards within columns
  - Editable card title and description fields
## Pages
- /kanban
  contains:
  - Main Panel
  - Side Panel
- /kanban/{kanban_id}
  contains:
  - Main Panel
  - Side Panel
  - Kanban Board View of selected kanban_id
