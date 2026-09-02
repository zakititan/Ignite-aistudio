import type { PresenceStatusArea } from "@/lib/types";
import { OnlinePresenceStatusCard } from "@/components/OnlinePresenceStatusCard";

export function OnlinePresenceStatusGrid({ areas }: { areas: PresenceStatusArea[] }) {
  return (
    <section aria-labelledby="presence-overview-title" className="space-y-3">
      <div>
        <h2 id="presence-overview-title" className="font-display text-xl font-bold">
          Online presence overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Seven areas that make your business findable and contactable. Each shows where you stand and what
          to do next.
        </p>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a) => (
          <OnlinePresenceStatusCard key={a.id} area={a} />
        ))}
      </div>
    </section>
  );
}
