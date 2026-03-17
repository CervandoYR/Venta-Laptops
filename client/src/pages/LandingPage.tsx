import { useEffect, useState } from "react";

type LandingBlock = {
  id: string;
  type: string;
  order: number;
  isActive: boolean;
  content: any;
};

type LandingResponse = {
  blocks: LandingBlock[];
  settings: any;
};

export const LandingPage = () => {
  const [data, setData] = useState<LandingResponse | null>(null);

  useEffect(() => {
    fetch("/api/landing")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const blocks = data?.blocks ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Academy</div>
          <a
            href="/app"
            className="text-sm text-slate-300 hover:text-white border border-slate-700 rounded-md px-3 py-1"
          >
            Entrar al panel
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        {blocks.map((block) => {
          if (!block.isActive) return null;

          switch (block.type) {
            case "HERO": {
              const c = block.content;
              return (
                <section
                  key={block.id}
                  className="grid md:grid-cols-2 gap-8 items-center"
                >
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                      {c?.title ?? "Forma campeones desde pequeños"}
                    </h1>
                    <p className="text-slate-300 mb-6">
                      {c?.subtitle ??
                        "Programas deportivos para niños y jóvenes con entrenadores profesionales."}
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="#lead-form"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-md text-sm font-semibold"
                      >
                        Solicitar información
                      </a>
                      <a
                        href="#programs"
                        className="border border-slate-700 px-5 py-2 rounded-md text-sm text-slate-200"
                      >
                        Ver programas
                      </a>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40" />
                  </div>
                </section>
              );
            }
            default:
              return null;
          }
        })}

        <section id="lead-form" className="max-w-xl">
          <h2 className="text-xl font-semibold mb-3">
            Solicita información para tu hijo/a
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            Déjanos tus datos y un asesor te contactará.
          </p>
          <LeadForm />
        </section>
      </main>
    </div>
  );
};

const LeadForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);
    setSuccess(false);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      e.currentTarget.reset();
    } catch {
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Input name="name" label="Nombre del alumno" required />
        <Input name="parentName" label="Nombre del apoderado" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input name="phone" label="Teléfono" required />
        <Input name="email" label="Email" type="email" />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Input name="childAge" label="Edad del alumno" type="number" />
        <Input
          name="interestProgram"
          label="Programa de interés"
          placeholder="Ej: Fútbol Sub-8"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar solicitud"}
      </button>
      {success && (
        <p className="text-xs text-emerald-400">
          ¡Gracias! Hemos recibido tu solicitud.
        </p>
      )}
    </form>
  );
};

const Input = ({
  label,
  name,
  type = "text",
  required,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) => (
  <label className="block text-sm">
    <span className="text-slate-200">{label}</span>
    <input
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
    />
  </label>
);

