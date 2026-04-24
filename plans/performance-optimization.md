# Performance Optimization Plan

## Stage 1 — React Memoization

Highest impact. Prevents cascade re-renders across the board.

- [ ] Wrap `KanbanCard` with `React.memo()` (`src/components/KanbanCard.tsx`)
- [ ] Wrap `KanbanColumn` with `React.memo()` (`src/components/KanbanColumn.tsx`)
- [ ] Wrap `KanbanBoardView` with `React.memo()` (`src/components/KanbanBoardView.tsx`)
- [ ] Wrap `InlineEdit` with `React.memo()` (`src/components/ui/inline-edit.tsx`)
- [ ] Wrap `ThemeToggle` handlers with `useCallback()` (`src/components/ThemeToggle.tsx`)
- [ ] Wrap all event handlers in `KanbanCard` with `useCallback()` (handleUpdate, handleDelete)
- [ ] Wrap all event handlers in `KanbanColumn` with `useCallback()` (handleUpdateColumn, handleDeleteColumn, handleCreateCard)
- [ ] Wrap all event handlers in `KanbanBoardView` with `useCallback()` (handleUpdateBoard, handleCreateColumn, handleMoveCard, handleReorderColumns, handleDragStart, handleDragEnd, handleMoveCardLeft/Right, handleMoveColumnLeft/Right)
- [ ] Add mounted guard to MainPanel click-outside useEffect (`src/components/MainPanel.tsx`)

---

## Stage 2 — Data Structure Optimization

Reduces O(n) lookups to O(1) during render and drag operations.

- [ ] Pre-compute `cardsByColumn` Map with `useMemo` in `KanbanBoardView` (replaces `getColumnCards` filter)
- [ ] Pre-compute `cardsById` Map with `useMemo` in `KanbanBoardView` (replaces `.find()` in drag handlers)
- [ ] Memoize `useSensors` call with `useMemo` in `KanbanBoardView`

---

## Stage 3 — Database & Server Optimization

Reduces request latency and database load.

- [ ] Run `getBoard` queries in parallel with `Promise.all` (`src/lib/kanban.ts:66-113`)
- [ ] Add database indexes on `kanbanBoardId` and `kanbanColumnId` foreign keys (`src/db/schema.ts`)
- [ ] Wrap delete-column queries in a transaction (`src/lib/kanban.ts:227-259`)
- [ ] Add in-memory session cache with TTL in `validateSessionInternal` (`src/lib/auth.ts`)
- [ ] Generate and run Drizzle migration for new indexes

---

## Stage 4 — Bundle & Build Optimization

Reduces initial load time and bundle size.

- [ ] Conditionally include DevTools plugin only in development (`vite.config.ts`)
- [ ] Implement route-level code splitting with `lazy()` (`src/router.tsx`)
- [ ] Add `font-display: swap` to font imports and consider subsetting (`src/styles.css`)
- [ ] Audit and tree-shake `@dnd-kit` imports if applicable

---

## Stage 5 — CSS & Rendering Polish

Low-priority paint and containment improvements.

- [ ] Simplify layered gradients and `mask-image: radial-gradient()` in kanban background (`src/styles.css:177-211`)
- [ ] Add `contain: layout style` to KanbanColumn and KanbanCard containers
- [ ] Evaluate `@tanstack/react-virtual` for boards with 50+ cards per column