import { createFileRoute } from "@tanstack/react-router";
import { DemoStart } from "@/components/io/DemoStart";

export const Route = createFileRoute("/demo/")({ component: DemoStart });
