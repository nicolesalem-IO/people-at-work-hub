import { createFileRoute } from "@tanstack/react-router";
import { Glossary } from "@/routes/glossary";

export const Route = createFileRoute("/demo/help")({ component: Glossary });
