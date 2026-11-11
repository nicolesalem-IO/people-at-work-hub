import { createFileRoute } from "@tanstack/react-router";
import { RolesDashboard } from '@/components/io/RolesDashboard';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your roles — I-O Workspace" },
      { name: "description", content: "Your evidence-based job analyses and candidate assessment batteries, in one workspace." },
      { property: "og:title", content: "Your roles — I-O Workspace" },
      { property: "og:description", content: "Your evidence-based job analyses and candidate assessment batteries, in one workspace." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return <RolesDashboard />;
}
