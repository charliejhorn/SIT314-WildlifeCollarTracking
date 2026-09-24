"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/client";

type Animal = { _id?: string; id?: string; name: string };
type Geofence = { _id?: string; id?: string; name: string };
type Collar = { _id?: string; id?: string; animal_id: string | number; fitted_date?: string | number };
type DisplayCollar = Collar & { animalName: string; geofenceName: string };
const idOf = (item: { _id?: string; id?: string }) => item._id ?? item.id ?? "";

export default function CollarsPage() {
  const [collars, setCollars] = useState<DisplayCollar[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [editing, setEditing] = useState<Collar | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [rawCollars, rawAnimals, rawGeofences] = await Promise.all([
        apiRequest<Collar[]>("/api/collars"), apiRequest<Animal[]>("/api/animals"), apiRequest<Geofence[]>("/api/geofences"),
      ]);
      const assignments = await Promise.all(rawCollars.map(async (collar) => {
        try { return await apiRequest<Geofence>(`/api/collars/${idOf(collar)}/geofence`); } catch { return null; }
      }));
      setAnimals(rawAnimals); setGeofences(rawGeofences);
      setCollars(rawCollars.map((collar, index) => ({ ...collar, animalName: rawAnimals.find((animal) => String(idOf(animal)) === String(collar.animal_id))?.name ?? String(collar.animal_id), geofenceName: assignments[index]?.name ?? "Unassigned" })));
    } catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { Promise.resolve().then(load); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const geofenceId = String(values.geofence_id); delete values.geofence_id;
    try {
      const saved = await apiRequest<Collar>(editing ? `/api/collars/${idOf(editing)}` : "/api/collars", { method: editing ? "PUT" : "POST", body: JSON.stringify(values) });
      let collarId = idOf(saved) || (editing ? idOf(editing) : "");
      if (!collarId) {
        const refreshed = await apiRequest<Collar[]>("/api/collars");
        collarId = idOf(refreshed.find((collar) => String(collar.animal_id) === String(values.animal_id) && String(collar.fitted_date ?? "") === String(values.fitted_date ?? "")) ?? {});
      }
      try {
        await apiRequest(`/api/collars/${collarId}/geofence`, { method: "PUT", body: JSON.stringify({ geofence_id: geofenceId }) });
      } catch (err) {
        setOpen(false); setEditing(null); await load(); setError(`Collar saved, but geofence assignment failed: ${(err as Error).message}`); return;
      }
      setOpen(false); setEditing(null); await load();
    } catch (err) { setError((err as Error).message); }
  }
  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Equipment</p><h1 className="mt-2 text-3xl font-bold">Collars</h1></div><button disabled={!animals.length} onClick={() => { setEditing(null); setOpen(true); }} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${animals.length ? "bg-emerald-700 hover:bg-emerald-800" : "cursor-not-allowed bg-slate-300"}`}>Add collar</button></div>
    {!animals.length && <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Add an animal before creating a collar. Visit the Animals page first.</p>}
    {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">ID</th><th className="px-5 py-3">Animal</th><th className="px-5 py-3">Fitted date</th><th className="px-5 py-3">Geofence</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{collars.map((collar) => <tr key={idOf(collar)} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-mono text-xs">{idOf(collar)}</td><td className="px-5 py-4 font-medium">{collar.animalName}</td><td className="px-5 py-4 text-slate-600">{collar.fitted_date ?? "-"}</td><td className="px-5 py-4 text-slate-600">{collar.geofenceName}</td><td className="px-5 py-4 text-right"><button className="font-medium text-emerald-700" onClick={() => { setEditing(collar); setOpen(true); }}>Edit</button></td></tr>)}</tbody></table>{!collars.length && <p className="px-5 py-10 text-center text-slate-500">No collars registered yet.</p>}</div>
    <Modal open={open} title={editing ? "Edit collar" : "Add collar"} onClose={() => { setOpen(false); setEditing(null); }}><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Animal<select name="animal_id" required defaultValue={editing?.animal_id} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Choose an animal</option>{animals.map((animal) => <option key={idOf(animal)} value={idOf(animal)}>{animal.name}</option>)}</select></label><label className="block text-sm font-medium">Fitted date<input name="fitted_date" type="date" defaultValue={String(editing?.fitted_date ?? "")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">Geofence<select name="geofence_id" required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">Choose a geofence</option>{geofences.map((geofence) => <option key={idOf(geofence)} value={idOf(geofence)}>{geofence.name}</option>)}</select></label><button className="w-full rounded-lg bg-emerald-700 py-2.5 font-semibold text-white hover:bg-emerald-800">Save collar</button></form></Modal>
  </main>;
}
