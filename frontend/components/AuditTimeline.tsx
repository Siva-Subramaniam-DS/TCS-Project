export type AuditEvent = {
  id: number;
  claim: string;
  source: string;
  event_type: string;
  created_at: string;
  hash: string;
  prev_hash: string;
};

export function AuditTimeline({ events, intact }: { events: AuditEvent[]; intact?: boolean }) {
  if (!events.length) {
    return <p className="text-sm text-[#5d6b63]">No audit events for this fund yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-[#d9d0c0] pl-5">
      {intact != null && (
        <li className="list-none">
          <span className={`stamp ${intact ? "" : "border-clay text-clay"}`}>{intact ? "Chain intact" : "Chain broken"}</span>
        </li>
      )}
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-leaf" />
          <p className="text-xs uppercase tracking-wider text-sea">{event.event_type.replaceAll("_", " ")}</p>
          <p className="mt-1 text-sm">{event.claim}</p>
          <p className="mt-1 text-xs text-[#5d6b63]">
            {event.source} · {event.created_at.replace("T", " ").replace("Z", " UTC")}
          </p>
          <p className="mono mt-1 break-all text-[11px] text-[#3d4f46]">
            {event.hash.slice(0, 18)}… ← {event.prev_hash.slice(0, 10)}…
          </p>
        </li>
      ))}
    </ol>
  );
}
