// Palabras clave principales (Secciones y Atributos)
const KEYWORDS = [
  'MARCA', 'MODELO', 'PART NUMBER', 'COLOR', 'PANTALLA', 'RESOLUCION', 
  'CPU', 'PROCESADOR', 'OBSERVACIONES', 'CHIPSET', 'MEMORIA', 'RAM', 
  'CAPACIDAD', 'BUS', 'TIPO', 'ALMACENAMIENTO', 'DISCO', 'INTERFAZ', 
  'VIDEO', 'GRAFICOS', 'CONECTIVIDAD', 'WIRELESS', 'BLUETOOTH', 
  'SONIDO', 'PUERTOS', 'BATERIA', 'DIMENSIONES', 'PESO', 
  'SISTEMA OPERATIVO', 'GARANTIA', 'COMENTARIOS', 'CAMARA', 'TECLADO', 'ADAPTADOR'
];

export const parseDeltronText = (text: string) => {
  // 1. CORRECCIÓN DEL ERROR DE BUILD:
  // Devolvemos un objeto con TODOS los campos vacíos si no hay texto.
  // Esto evita que TypeScript grite "Property 'ports' does not exist".
  if (!text) return { 
    specs: {}, 
    description: '',
    brand: '', 
    model: '', 
    cpu: '', 
    ram: '', 
    storage: '', 
    display: '', 
    gpu: '', 
    ports: '', 
    battery: '', 
    weight: '' 
  };

  // 2. Limpieza inicial
  let cleanText = text
    .replace(/\t/g, ' ') 
    .replace(/\n/g, '  ') 
    .replace(/\s+/g, ' '); 

  const specs: Record<string, string> = {};
  
  // 3. Encontrar posiciones de claves
  const matches: { key: string, index: number }[] = [];
  
  KEYWORDS.forEach(key => {
    let idx = cleanText.toUpperCase().indexOf(key);
    while (idx !== -1) {
      matches.push({ key, index: idx });
      idx = cleanText.toUpperCase().indexOf(key, idx + 1);
    }
  });

  matches.sort((a, b) => a.index - b.index);

  // 4. Extraer valores
  matches.forEach((match, i) => {
    const nextMatch = matches[i + 1];
    const start = match.index + match.key.length;
    const end = nextMatch ? nextMatch.index : cleanText.length;
    
    let value = cleanText.substring(start, end).trim();
    value = value.replace(/^[:\-\.\s]+|[:\-\.\s]+$/g, '').trim();

    if (value && value.length > 1) { 
      const prettyKey = match.key.charAt(0) + match.key.slice(1).toLowerCase();
      if (specs[prettyKey]) {
         specs[prettyKey] += ` | ${value}`;
      } else {
         specs[prettyKey] = value;
      }
    }
  });

  // Helpers
  const find = (keys: string[]) => {
      for (const k of keys) {
          const foundKey = Object.keys(specs).find(sk => sk.toUpperCase().includes(k));
          if(foundKey) return specs[foundKey];
      }
      return '';
  }

  // Generar descripción HTML
  let descriptionHTML = '<ul class="space-y-1">';
  Object.entries(specs).forEach(([k, v]) => {
      if (!['FORMATO', 'COMENTARIOS'].includes(k.toUpperCase())) {
          descriptionHTML += `<li><strong>${k}:</strong> ${v}</li>`;
      }
  });
  descriptionHTML += '</ul>';

  return {
    specs,
    description: descriptionHTML,
    brand: find(['MARCA']),
    model: find(['MODELO']),
    cpu: find(['PROCESADOR', 'CPU']),
    ram: find(['MEMORIA', 'RAM']),
    storage: find(['ALMACENAMIENTO', 'DISCO']),
    display: find(['PANTALLA']),
    gpu: find(['VIDEO', 'GRAFICOS']),
    ports: find(['PUERTOS']),
    battery: find(['BATERIA']),
    weight: find(['PESO'])
  };
}