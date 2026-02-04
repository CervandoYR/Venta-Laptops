export interface ParsedProduct {
  name: string;
  brand: string;
  model: string;
  category: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  display?: string;
  gpu?: string;
  ports?: string;
  battery?: string;
  warrantyMonths?: number;
  specs: Record<string, string>;
  description: string;
}

export function parseDeltronText(text: string): ParsedProduct {
  // 1. LIMPIEZA PREVIA (Separa palabras pegadas)
  let cleanText = text
    .replace(/(Procesador|CPU|Core|Ryzen)/gi, '\nProcesador: ')
    .replace(/(Memoria|RAM)/gi, '\nRAM: ')
    .replace(/(Almacenamiento|Disco|SSD|HDD)/gi, '\nAlmacenamiento: ')
    .replace(/(Pantalla|Display|Monitor)/gi, '\nPantalla: ')
    .replace(/(Gráficos|Video|GPU|VGA)/gi, '\nVideo: ')
    .replace(/(Teclado)/gi, '\nTeclado: ')
    .replace(/(Cámara|Webcam)/gi, '\nCámara: ')
    .replace(/(Batería|Battery)/gi, '\nBatería: ')
    .replace(/(Conectividad|WLAN|Bluetooth|WiFi)/gi, '\nConectividad: ')
    .replace(/(Peso)/gi, '\nPeso: ')
    .replace(/(Color)/gi, '\nColor: ')
    .replace(/[,|⚡]/g, '\n');

  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const result: ParsedProduct = {
    name: '', brand: '', model: '', category: 'Laptops', warrantyMonths: 0, specs: {}, description: ''
  };

  if (lines.length > 0) result.name = lines[0];

  // Detección de Categoría
  const upperText = text.toUpperCase();
  if (upperText.includes('CASE') || upperText.includes('GABINETE')) result.category = 'Componentes';
  else if (upperText.includes('MOUSE') || upperText.includes('TECLADO')) result.category = 'Periféricos';
  else if (upperText.includes('MONITOR')) result.category = 'Monitores';
  else if (upperText.includes('PC') || upperText.includes('DESKTOP')) result.category = 'PC Escritorio';

  const descriptionLines: string[] = [];

  for (const line of lines) {
    const l = line.toLowerCase();
    const value = line.split(':')[1]?.trim() || line;

    if (l.includes('procesador')) result.cpu = value;
    if (l.includes('ram') || l.includes('memoria')) result.ram = value;
    if (l.includes('almacenamiento') || l.includes('ssd')) result.storage = value;
    if (l.includes('pantalla')) result.display = value;
    if (l.includes('video') || l.includes('grafic')) result.gpu = value;
    if (l.includes('batería')) result.battery = value;

    // Specs para tabla
    if (line.includes(':')) {
      const parts = line.split(':');
      if (parts.length === 2 && parts[0].length < 20) {
        result.specs[parts[0].trim()] = parts[1].trim();
      }
    }
    descriptionLines.push(`<li>${line}</li>`);
  }

  if (descriptionLines.length > 0) result.description = `<ul>${descriptionLines.join('')}</ul>`;
  
  // Nombre fallback
  if (!result.name) result.name = `${result.brand} ${result.model}`.trim();

  return result;
}