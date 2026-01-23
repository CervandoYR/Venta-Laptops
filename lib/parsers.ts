// Lista ampliada de palabras clave comunes en fichas técnicas (Deltron, Ingram, etc.)
const KNOWN_KEYS = [
  'FORMATO', 'DESCRIPCION', 'MARCA', 'MODELO', 'PART NUMBER', 'COLOR', 
  'PANTALLA', 'RESOLUCION', 'CPU', 'PROCESADOR', 'OBSERVACIONES DE CPU', 'OBSERVACIONES', 
  'CHIPSET', 'MEMORIA', 'RAM', 'CAPACIDAD', 'TIPO DE RANURAS', 'EXPANSION MAXIMA', 'COMENTARIOS',
  'ALMACENAMIENTO', 'DISCO', 'TIPO DE DISCO', 'INTERFAZ', 'RANURAS DE EXPANSION',
  'VIDEO', 'CHIPSET GRAFICO', 'SALIDAS', 'CONECTIVIDAD', 'WIRELESS', 'BLUETOOTH',
  'SONIDO', 'PARLANTES', 'PUERTOS', 'WEBCAM', 'TOUCHPAD', 'TECLADO', 'IDIOMA DE TECLADO',
  'ALIMENTACION', 'BATERIA', 'ADAPTADOR', 'DIMENSIONES', 'PESO', 
  'SISTEMA OPERATIVO', 'VERSION SISTEMA', 'GARANTIA', 'CERTIFICACIONES'
];

export const parseDeltronText = (text: string) => {
  if (!text) return { specs: {}, description: '' };

  // 1. Limpieza inicial: Reemplazamos saltos de línea por un separador único
  // para tratar todo como una sola línea y luego separar.
  let cleanText = text
    .replace(/\t/g, ' ') 
    .replace(/\n/g, ' :: ') 
    .replace(/\s+/g, ' '); 

  const specs: Record<string, string> = {};
  const foundKeys: { key: string, index: number }[] = [];
  
  // 2. Buscar todas las palabras clave en el texto
  KNOWN_KEYS.forEach(key => {
    // Buscamos la clave. El "toUpperCase" ayuda a que no importe mayúsculas/minúsculas
    let idx = cleanText.toUpperCase().indexOf(key);
    
    // Si la encuentra, guardamos la posición. 
    // Ojo: Si hay claves repetidas (ej: CAPACIDAD en RAM y en DISCO), 
    // este parser básico tomará la primera aparición o necesitaría lógica recursiva.
    // Para simplificar y ser rápidos, buscamos todas las ocurrencias.
    while (idx !== -1) {
      // Verificamos si ya guardamos esta posición para no duplicar
      if (!foundKeys.some(k => k.index === idx)) {
         foundKeys.push({ key, index: idx });
      }
      // Buscar siguiente ocurrencia
      idx = cleanText.toUpperCase().indexOf(key, idx + 1);
    }
  });

  // 3. Ordenar por orden de aparición
  foundKeys.sort((a, b) => a.index - b.index);

  // 4. Extraer valores entre claves
  foundKeys.forEach((item, i) => {
    const nextItem = foundKeys[i + 1];
    const start = item.index + item.key.length;
    const end = nextItem ? nextItem.index : cleanText.length;
    
    let value = cleanText.substring(start, end).trim();
    
    // Limpiar basura al inicio del valor (: - .)
    value = value.replace(/^[:\-\s\.]+/, '')
                 .replace(/::/g, '\n') // Restaurar saltos de línea visuales
                 .trim();

    if (value) {
      // Capitalizar clave para que se vea bien (FORMATO -> Formato)
      const prettyKey = item.key.charAt(0) + item.key.slice(1).toLowerCase();
      
      // Si la clave ya existe (ej: Capacidad), le agregamos un sufijo o contexto si es posible,
      // o simplemente la sobrescribimos (limitación actual aceptable para MVP)
      if(specs[prettyKey]) {
          specs[prettyKey + ' (Extra)'] = value;
      } else {
          specs[prettyKey] = value;
      }
    }
  });

  // 5. Generar una descripción HTML bonita
  let autoDescription = '<ul class="list-disc pl-5 space-y-1 text-sm">';
  Object.entries(specs).forEach(([key, val]) => {
    // Filtramos campos irrelevantes para la descripción pública
    if(!['FORMATO', 'COMENTARIOS', 'PART NUMBER'].includes(key.toUpperCase())) {
        autoDescription += `<li><strong class="font-semibold text-gray-700">${key}:</strong> ${val.replace(/\n/g, ', ')}</li>`;
    }
  });
  autoDescription += '</ul>';

  return {
    specs,
    description: autoDescription,
    // Helpers para autocompletar inputs
    brand: specs['Marca'] || '',
    model: specs['Modelo'] || '',
    cpu: specs['Cpu'] || specs['Procesador'] || '',
    ram: specs['Memoria'] || specs['Ram'] || '',
    storage: specs['Almacenamiento'] || specs['Disco'] || '',
    display: specs['Pantalla'] || '',
    gpu: specs['Video'] || specs['Chipset grafico'] || '',
    system: specs['Sistema operativo'] || ''
  };
}