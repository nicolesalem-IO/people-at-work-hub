import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HiringPacket } from "@/components/io/HiringPacket";
import { packetDemo } from "@/data/packet-demo";

export const Route = createFileRoute("/package")({
  head: () => ({
    meta: [
      { title: "Hiring team packet — I-O Workspace" },
      {
        name: "description",
        content: "One work sample, a teach-back and a structured interview, each scored on written 1 to 5 anchors.",
      },
      { property: "og:title", content: "Hiring team packet — I-O Workspace" },
      {
        property: "og:description",
        content: "One work sample, a teach-back and a structured interview, each scored on written 1 to 5 anchors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PacketPage,
});

function PacketPage() {
  return (
    <>
      <div className="packet-toolbar">
        <p className="text-muted-foreground">
          Sample packet for a fictional role. In the app, experts approve every exercise and anchor before use.
        </p>
        <Button onClick={() => window.print()}>
          <Printer /> Print or save as PDF
        </Button>
      </div>
      <HiringPacket data={packetDemo} />
    </>
  );
}
