import { createFileRoute } from "@tanstack/react-router";
import { AssessmentAnalysis } from '@/components/io/AssessmentAnalysis';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rating-based job analysis — I-O Workspace" },
      { name: "description", content: "O*NET benchmarks, SME ratings and testable entry-required KSAOs for candidate assessment." },
      { property: "og:title", content: "Rating-based job analysis — I-O Workspace" },
      { property: "og:description", content: "O*NET benchmarks, SME ratings and testable entry-required KSAOs for candidate assessment." },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return <AssessmentAnalysis />;
}
