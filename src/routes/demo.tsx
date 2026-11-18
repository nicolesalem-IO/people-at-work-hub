import { createFileRoute, Outlet } from "@tanstack/react-router";
import { KitProvider } from "@/components/io/KitStore";
import { WorkspaceProvider } from "@/components/io/WorkspaceStore";

// The demo: the same screens as the product, on a fictional company's data saved in this browser.
export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo — Thebe IO" },
      { name: "description", content: "See a fictional hire from every seat: builder, HR, rater, hiring manager and job expert." },
    ],
  }),
  component: () => (
    <KitProvider>
      <WorkspaceProvider mode="demo">
        <Outlet />
      </WorkspaceProvider>
    </KitProvider>
  ),
});
