export function ChangeLogPane() {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg">Change Log</h3>
      <p className="text-muted-foreground text-sm">
        Stream of Orchestrator actions and decisions.
      </p>
      <div className="mt-4 border border-dashed p-8 text-center text-muted-foreground">
        Task logs will be streamed here.
      </div>
    </div>
  );
}
