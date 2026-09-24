"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/client";

type Animal = { _id?: string; id?: string; name: string; species: string; birth_date: string };
const idOf = (item: Animal) => item._id ?? item.id ?? "";

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try { setAnimals(await apiRequest<Animal[]>("/api/animals")); } catch (err) { setError((err as Error).message); }
  }
  useEffect(() => {
    apiRequest<Animal[]>("/api/animals")
      .then(setAnimals)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest(editing ? `/api/animals/${idOf(editing)}` : "/api/animals", { method: editing ? "PUT" : "POST", body: JSON.stringify(values) });
      setOpen(false); setEditing(null); await load();
    } catch (err) { setError((err as Error).message); }
  }
  return <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Registry</p><h1 className="mt-2 text-3xl font-bold">Animals</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Add animal</button></div>
    {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Species</th><th className="px-5 py-3">Birth date</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{animals.map((animal) => <tr key={idOf(animal)} className="border-b border-slate-100 last:border-0"><td className="px-5 py-4 font-medium">{animal.name}</td><td className="px-5 py-4 text-slate-600">{animal.species}</td><td className="px-5 py-4 text-slate-600">{animal.birth_date}</td><td className="px-5 py-4 text-right"><button className="font-medium text-emerald-700" onClick={() => { setEditing(animal); setOpen(true); }}>Edit</button></td></tr>)}</tbody></table>{animals.length === 0 && <p className="px-5 py-10 text-center text-slate-500">No animals registered yet.</p>}</div>
    <Modal open={open} title={editing ? "Edit animal" : "Add animal"} onClose={() => { setOpen(false); setEditing(null); }}><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Name<input name="name" required defaultValue={editing?.name} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">Species<input name="species" required defaultValue={editing?.species} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium">Birth date<input name="birth_date" type="date" required defaultValue={editing?.birth_date} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><button className="w-full rounded-lg bg-emerald-700 py-2.5 font-semibold text-white hover:bg-emerald-800">Save animal</button></form></Modal>
  </main>;
}
