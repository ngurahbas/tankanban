# Database, UI Components, and Pages
## Database
This project uses  sqlite.
### Kanban Board
table name: kanban_board
fields: 
- id: primary key
- name
- created_at
- updated_at
### Kanban Card
table name: kanban_card
fields: 
- id: primary key
- kanban_board_id: foreign key referencing kanban_board.id
- name
- description
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
## Pages
- /kanban
- /kanban/{kanban_id}
