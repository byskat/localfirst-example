import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/presentation")({
  component: PresentationPage,
});

function PresentationPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Presentation</h1>
      <p className="text-muted-foreground">
        This is the presentation page content.
      </p>
    </div>
  );
}
