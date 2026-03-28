import { createFileRoute } from '@tanstack/react-router'
import { KanbanIndexPage } from './-index-component'

export const Route = createFileRoute('/kanban/')({
  component: KanbanIndexPage,
})
