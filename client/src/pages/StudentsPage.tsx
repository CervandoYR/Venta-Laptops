import { useEffect, useState } from "react";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
};

type ListResponse = {
  items: Student[];
  total: number;
};

export const StudentsPage = () => {
  const [data, setData] = useState<ListResponse>({ items: [], total: 0 });

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Alumnos</h2>
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Alumno</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-3 py-2">{s.status}</td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-6 text-center text-slate-400 text-xs"
                >
                  No hay alumnos registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

