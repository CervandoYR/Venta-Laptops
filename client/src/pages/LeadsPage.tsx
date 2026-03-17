import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
};

export const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Leads</h2>
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Nombre</th>
              <th className="px-3 py-2 text-left font-medium">Contacto</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{l.name}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span>{l.phone}</span>
                    {l.email && (
                      <span className="text-xs text-slate-400">{l.email}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs uppercase">{l.status}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-slate-400 text-xs"
                >
                  Aún no hay leads registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

