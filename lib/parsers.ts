// lib/parsers.ts

export interface ParsedProduct {
  name: string;
  brand: string;
  model: string;
  category: string; // Detección automática de categoría
  cpu?: string;
  ram?: string;
  storage?: string;
  display?: string;
  gpu?: string;
  ports?: string;
  battery?: string;
  warrantyMonths?: number; // Detección de Garantía
  specs: Record<string, string>;
  description: string;
}

export function parseDeltronText(text: string): ParsedProduct {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const result: ParsedProduct = {
    name: '',
    brand: '',
    model: '',
    category: 'Laptops', // Default
    warrantyMonths: 0,
    specs: {},
    description: ''
  };

  if (lines.length > 0) result.name = lines[0];

  // 1. DETECCIÓN INTELIGENTE DE CATEGORÍA
  const upperText = text.toUpperCase();
  if (upperText.includes('GABINETE') || upperText.includes('CASE ') || upperText.includes('FUENTE DE PODER') || upperText.includes('TARJETA DE VIDEO') || upperText.includes('RYZEN') || upperText.includes('CORE I') || upperText.includes('MAINBOARD')) {
    result.category = 'Componentes';
  } else if (upperText.includes('MOUSE') || upperText.includes('TECLADO') || upperText.includes('WEBCAM')) {
    result.category = 'Periféricos';
  } else if (upperText.includes('MONITOR')) {
    result.category = 'Monitores';
  } else if (upperText.includes('AUDIFONO') || upperText.includes('PARLANTE') || upperText.includes('HEADSET')) {
    result.category = 'Audio';
  } else if (upperText.includes('ALL IN ONE') || upperText.includes('DESKTOP')) {
    result.category = 'PC Escritorio';
  }

  const descriptionLines: string[] = [];
  let foundDescription = false;

  for (const line of lines) {
    const l = line.toLowerCase();

    // Detección de Marca y Modelo (Básico)
    if (l.startsWith('marca')) result.brand = line.split(':')[1]?.trim() || '';
    if (l.startsWith('modelo') || l.startsWith('nro. de parte')) result.model = line.split(':')[1]?.trim() || '';

    // GARANTÍA: Busca "12 meses", "1 año", "36 meses", etc.
    if (l.includes('garantia') || l.includes('garantía')) {
      const match = line.match(/(\d+)\s*(meses|mes|años|año)/i);
      if (match) {
        let months = parseInt(match[1]);
        if (match[2].toLowerCase().includes('año')) months *= 12;
        result.warrantyMonths = months;
      }
    }

    // Extracción de Specs Estándar (si aplican)
    if (l.includes('procesador') || l.includes('cpu')) result.cpu = line.split(':')[1]?.trim();
    if (l.includes('memoria') || l.includes('ram')) result.ram = line.split(':')[1]?.trim();
    if (l.includes('almacenamiento') || l.includes('disco') || l.includes('ssd')) result.storage = line.split(':')[1]?.trim();
    if (l.includes('pantalla') || l.includes('display')) result.display = line.split(':')[1]?.trim();
    if (l.includes('video') || l.includes('grafico') || l.includes('gpu')) result.gpu = line.split(':')[1]?.trim();

    // Extracción Universal (Key: Value) para la tabla dinámica (Mouse, Case, etc.)
    if (line.includes(':') && !l.includes('http')) {
      const [key, val] = line.split(/:(.+)/);
      if (key && val && key.length < 30) {
        result.specs[key.trim()] = val.trim();
      }
    }

    // Descripción HTML
    if (l.includes('caracteristicas') || l.includes('especificaciones')) foundDescription = true;
    if (foundDescription && !line.includes(':')) {
      descriptionLines.push(`<li>${line}</li>`);
    }
  }

  if (descriptionLines.length > 0) {
    result.description = `<ul>${descriptionLines.join('')}</ul>`;
  }

  // Fallback para nombres
  if (!result.brand && result.name) result.brand = result.name.split(' ')[0];

  return result;
}