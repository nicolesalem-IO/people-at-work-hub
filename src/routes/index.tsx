import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from '@/components/io/Welcome';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Test what the job actually needs — Thebe IO" },
      { name: "description", content: "Turn real job evidence into skills tests, aptitude tests and fair hiring decisions." },
      { property: "og:title", content: "Test what the job actually needs — Thebe IO" },
      { property: "og:description", content: "Turn real job evidence into skills tests, aptitude tests and fair hiring decisions." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return <Welcome />;
}
