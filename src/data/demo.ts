import type { Status } from "@/components/io/status";

export const role = {
  org: "Northwind Support Co. (fictional)",
  title: "Customer Support Specialist",
  locations: "Denver · Austin · Remote",
  approver: "Dana Ortiz, HR Director",
};

export const stages: { key: string; name: string; status: Status; next: string }[] = [
  { key: "A", name: "Set up", status: "approved", next: "Complete" },
  { key: "B", name: "Collect evidence", status: "approved", next: "4 of 4 contributors submitted" },
  { key: "C", name: "Task inventory", status: "draft", next: "Analyst review of 12 tasks" },
  { key: "D", name: "Ratings", status: "pending", next: "1 rating survey outstanding" },
  { key: "E", name: "Reconcile & approve", status: "conflict", next: "Resolve refund-authority conflict" },
  { key: "F", name: "Job evaluation", status: "unconfigured", next: "Approved factor plan not supplied" },
  { key: "G", name: "Hiring package", status: "pending", next: "Unlocks after role approval" },
];

export const evidence: { id: string; source: string; contributor: string; excerpt: string; task: string; status: Status }[] = [
  { id: "EV-01", source: "Incumbent interview", contributor: "Incumbent A", excerpt: "Refunds over $50 need a lead's approval before I can issue them.", task: "Process refunds", status: "conflict" },
  { id: "EV-02", source: "Incumbent interview", contributor: "Incumbent B", excerpt: "I submit refund requests; a team lead approves them in the queue.", task: "Process refunds", status: "conflict" },
  { id: "EV-03", source: "Manager description", contributor: "Manager", excerpt: "Specialists resolve refunds independently end-to-end.", task: "Process refunds", status: "conflict" },
  { id: "EV-04", source: "SOP-14 Refund policy v3", contributor: "Document", excerpt: "Refunds above $50 require Tier-2 approval.", task: "Process refunds", status: "approved" },
  { id: "EV-05", source: "Incumbent interview", contributor: "Incumbent C", excerpt: "Most of my day is chat and email triage across three queues.", task: "Triage inbound tickets", status: "approved" },
  { id: "EV-06", source: "—", contributor: "—", excerpt: "No evidence yet for bilingual support requirement.", task: "Support Spanish-speaking customers", status: "missing" },
];
