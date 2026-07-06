export const ProductShowcase = () => {
  return (
    <section className="p-4 md:p-5 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          everything you need to send newsletters
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-border rounded-lg p-8 space-y-4 bg-card/50">
            <h3 className="text-xl font-semibold">dashboard</h3>
            <p className="text-muted-foreground text-sm">
              manage subscribers and campaigns. everything in one place, no
              bloat.
            </p>
            <div className="aspect-video bg-muted rounded-lg border border-border" />
          </div>

          <div className="border border-border rounded-lg p-8 space-y-4 bg-card/50">
            <h3 className="text-xl font-semibold">markdown editor</h3>
            <p className="text-muted-foreground text-sm">
              write in markdown. preview instantly. publish without touching a
              gui.
            </p>
            <div className="aspect-video bg-muted rounded-lg border border-border" />
          </div>

          <div className="border border-border rounded-lg p-8 space-y-4 bg-card/50">
            <h3 className="text-xl font-semibold">send from code</h3>
            <p className="text-muted-foreground text-sm">
              integrate with your app. send newsletters from anywhere in your
              codebase.
            </p>
            <div className="aspect-video bg-muted rounded-lg border border-border" />
          </div>
        </div>
      </div>
    </section>
  );
};
