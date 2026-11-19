import { createFileRoute } from "@tanstack/react-router";
import { AdminCenter } from "@/components/io/AdminCenter";

export const Route = createFileRoute("/demo/team")({ component: AdminCenter });
