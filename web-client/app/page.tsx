export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Field operations</p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Keep every animal within sight.</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Manage animals, collars, and geofences from one calm operational view.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href="/animals" className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">View animals</a>
        <a href="/geofences" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-emerald-600">Manage geofences</a>
      </div>
      </main>
  );
}
