"use client";

import type { ReactNode } from "react";

type ModalProps = { open: boolean; title: string; onClose: () => void; children: ReactNode };

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button className="text-2xl leading-none text-slate-400 hover:text-slate-700" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
