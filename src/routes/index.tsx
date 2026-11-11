import { createFileRoute } from "@tanstack/react-router";
import { InterviewWorkspace } from '@/components/io/InterviewWorkspace';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Job-analysis interview — I-O Workspace" },
      { name: "description", content: "Purpose-first job analysis with source-linked answers, module coverage and HR review." },
      { property: "og:title", content: "Job-analysis interview — I-O Workspace" },
      { property: "og:description", content: "Purpose-first job analysis with source-linked answers, module coverage and HR review." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return <InterviewWorkspace />;
}
