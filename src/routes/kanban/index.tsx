import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/kanban/')({
  component: lazyRouteComponent(() => import('./-index-component'), 'KanbanIndexPage'),
})
