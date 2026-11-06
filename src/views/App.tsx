import { Badge } from "@radix-ui/themes";
import { Box } from "lucide-react";

export function App() {
  return (
    <main className="atlas">
      <header className="brand">
        <Box size={48} strokeWidth={1} aria-hidden="true" />
        <div>
          <h1>LINIE</h1>
          <p>NETWORK OPERATIONS / INFRASTRUCTURE ATLAS</p>
        </div>
      </header>
      <section className="welcome">
        <Badge variant="outline">LOCAL DEMO</Badge>
        <h2>A clear view of your infrastructure.</h2>
        <p>React · TypeScript · Radix Themes · Vite · MVVM</p>
      </section>
    </main>
  );
}
