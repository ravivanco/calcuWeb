import type { AccessoryRule, Product, FamilyId, Texture } from '../types/calculator';

export const CATALOG_VERSION = 'decokasa-manual-2026-10-v1';
const adhesive = (panels: number, transparent = false): AccessoryRule => ({
  id: transparent ? 'silicona-transparente' : 'gorilax',
  name: transparent ? 'Silicón transparente' : 'Gorilax · silicona estructural',
  unit: 'envase', panelsPerUnit: panels, available: !transparent,
  sourceNote: `Manual, continuación por orden de filas: 1 silicón por ${panels} paneles. Presentación del envase por confirmar.`,
});
const fastening = (n: number, includeAnchors: boolean): AccessoryRule[] => [
  { id: 'vinchas', name: 'Vinchas de fijación', unit: 'unidad', unitsPerPanel: n, sourceNote: `${n} vinchas por panel según el manual.` },
  { id: 'tornillos', name: 'Tornillos para vinchas', unit: 'unidad', unitsPerPanel: n, sourceNote: '1 tornillo por vincha según el manual.' },
  ...(includeAnchors ? [{ id: 'tacos', name: 'Tacos para vinchas', unit: 'unidad', unitsPerPanel: n, sourceNote: '1 taco por vincha según el manual.' }] : []),
];
const pvcNote = 'El manual escribe «1 x plancha por lámina». Confirma el rendimiento de Gorilax antes de cuantificarlo.';

function sheet(id: string, name: string, family: FamilyId, w: number, h: number, published: number, texture: Texture, extra: Partial<Product> = {}): Product {
  return {
    id, reference: `DK-${id.toUpperCase()}`, name, family,
    description: 'Revestimiento decorativo para transformar tu espacio.',
    widthM: w, heightM: h, coverageM2: Number((w * h).toFixed(6)), publishedCoverageM2: published,
    saleUnit: 'pieza', environment: 'Interior', installation: 'Gorilax · silicona estructural',
    defaultMode: 'area', texture, accessoryRules: [], technicalNotes: [], complements: [], sourcePages: '1 y 3', ...extra,
  };
}

export const PRODUCTS: Product[] = [
  ...(['Prime', 'Delux', 'Premium', 'Bambú'] as const).map((name, i) => sheet(
    `pvc-${name === 'Bambú' ? 'bambu' : name.toLowerCase()}`, `Lámina PVC ${name}`, 'pvc', 1.22, 2.44, 2.98,
    (['marble', 'marble-dark', 'marble', 'bamboo'] as Texture[])[i]!,
    { description: name === 'Bambú' ? 'Lámina decorativa PVC Bambú para interiores.' : `Línea ${name} de revestimiento PVC para interiores.`, technicalNotes: [pvcNote], complements: ['Perfil de acabado', 'Perfil de luz y LED', 'Paneles WPC o WPET'] },
  )),
  sheet('adhesiva-3m', 'Lámina Adhesiva 3 Metros', 'adhesivas', 1.20, 3, 3.60, 'wood', { installation: 'Autoadhesiva', description: 'Formato de tres metros con instalación autoadhesiva.', complements: ['Cinta metálica para uniones', 'Paneles WPC o WPET'] }),
  sheet('adhesiva-satin', 'Lámina Adhesiva Satin', 'adhesivas', 0.60, 2.44, 1.46, 'marble', { installation: 'Autoadhesiva', description: 'Lámina autoadhesiva para revestimientos interiores.', complements: ['Paneles WPC o WPET'] }),
  sheet('geometrico-clasico', 'Geométrico Clásico', 'geometricos', 0.60, 0.60, 0.36, 'geometric', { description: 'Módulos decorativos de 60 × 60 cm.', defaultMode: 'layout', installation: 'Gorilax y tornillos según montaje', accessoryRules: [adhesive(8)], technicalNotes: ['El manual menciona tornillos, pero no indica cuántos ni cuándo son necesarios. Confirma el montaje.'], complements: ['Paneles WPC o WPET'] }),
  sheet('geometrico-design', 'Geométrico Design Premium', 'geometricos', 0.60, 2.60, 1.56, 'geometric', { description: 'Panel geométrico de gran formato para interiores.', defaultMode: 'layout', installation: 'Gorilax y tornillos según montaje', accessoryRules: [adhesive(2)], technicalNotes: ['La cantidad de tornillos debe confirmarse con instalación.'], complements: ['Paneles WPC o WPET'] }),
  ...([{ size: 'S', width: 0.16, coverage: 0.46 }, { size: 'M', width: 0.20, coverage: 0.58 }, { size: 'L', width: 0.30, coverage: 0.87 }] as const).map(({ size, width, coverage }) => sheet(`wpet-${size.toLowerCase()}`, `Panel WPET ${size}`, 'wpet', width, 2.90, coverage, 'slats', { description: `Panel decorativo WPET de ${width * 100} cm de ancho.`, defaultMode: 'layout', accessoryRules: [adhesive(3)], complements: ['Láminas PVC'] })),
  sheet('wpc-exterior', 'WPC Exterior', 'exteriores', 0.22, 2.90, 0.63, 'slats-dark', { description: 'Panel WPC para revestimientos exteriores.', environment: 'Exterior', defaultMode: 'layout', installation: 'Vinchas, tornillos y tacos', accessoryRules: fastening(4, false), technicalNotes: ['El manual requiere tacos, pero no cuantifica su proporción para WPC Exterior. Confirma la cantidad.'], complements: ['Perfiles', 'Piedra PU'] }),
  sheet('metal-siding', 'Metal Siding', 'exteriores', 0.39, 2.90, 1.13, 'siding', { description: 'Revestimiento metálico para fachadas.', environment: 'Exterior', defaultMode: 'layout', installation: 'Tornillos', technicalNotes: ['El manual indica «15 tacos y 15 tornillos» sin explicitar la base. Confirma si corresponde a cada panel.'], complements: ['Perfil de unión', 'Perfil de inicio y fin', 'Esquinas', 'Tapamarcos y recubrimiento'] }),
  { id: 'piso-pvc', reference: 'DK-PISO-PVC', name: 'Piso PVC Adhesivo', family: 'pisos', description: 'Piso autoadhesivo vendido en cajas completas de 5 m².', coverageM2: 5, publishedCoverageM2: 5, saleUnit: 'caja', environment: 'Interior', installation: 'Autoadhesivo según modelo', defaultMode: 'area', texture: 'wood', accessoryRules: [], technicalNotes: ['La continuación del manual menciona tornillos y tacos en una fila que contradice el piso autoadhesivo. No se han añadido: confirma esta información.'], complements: ['Zócalos'], sourcePages: '1 y 3' },
  sheet('cielo-pvc', 'Cielo Raso PVC', 'cielos', 0.25, 5.95, 1.48, 'ceiling', { description: 'Panel de PVC de 5,95 m de largo para cielo raso.', defaultMode: 'layout', installation: 'Tornillos', technicalNotes: ['El manual no cuantifica tornillos ni estructura de soporte. El resultado no constituye un diseño estructural.'], complements: ['Perfiles', 'Molduras', 'LED'] }),
  sheet('piedra-flexible', 'Piedra Flexible', 'piedras', 0.60, 1.20, 0.72, 'stone', { description: 'Revestimiento de piedra flexible en formato de 60 × 120 cm.', accessoryRules: [adhesive(4)], complements: ['Perfiles de inicio y unión', 'Cornizas'] }),
  sheet('piedra-pu', 'Piedra PU', 'piedras', 0.60, 1.20, 0.72, 'stone', { description: 'Panel de piedra PU para interiores y exteriores.', environment: 'Interior y exterior', accessoryRules: [adhesive(4)], technicalNotes: ['El PDF tiene un error de texto en la cobertura. Se usa el área geométrica de 0,60 × 1,20 m = 0,72 m².'], complements: ['Luz LED'] }),
  sheet('piedra-traslucida', 'Piedra Traslúcida', 'piedras', 0.60, 1.20, 0.72, 'onyx', { description: 'Revestimiento translúcido para composiciones con iluminación.', installation: 'Silicón transparente', accessoryRules: [adhesive(4, true)], technicalNotes: ['El silicón transparente figura como no disponible en Decokasa. Debe conseguirse por separado.', 'El PDF tiene un error de texto en la cobertura. Se utiliza 0,72 m² por dimensiones.'], complements: ['Luz LED'], sourcePages: '2 y 4' }),
  sheet('wpc-290', 'Panel WPC', 'wpc', 0.15, 2.90, 0.43, 'slats', { description: 'Panel ranurado de 15 cm de ancho y 2,90 m de largo.', defaultMode: 'layout', installation: 'Gorilax, vinchas, tornillos y tacos', accessoryRules: [adhesive(3), ...fastening(3, true)], complements: ['Perfil de luz', 'Luces LED'], sourcePages: '2 y 4' }),
  sheet('wpc-small', 'Panel WPC Small', 'wpc', 0.15, 2.60, 0.39, 'slats-dark', { description: 'Panel ranurado en formato de 2,60 m de largo.', defaultMode: 'layout', installation: 'Gorilax y vinchas con fijaciones por confirmar', accessoryRules: [adhesive(3)], technicalNotes: ['El manual omite cuántas vinchas lleva cada panel y no completa la proporción de tornillos y tacos. Confirma esas cantidades.'], complements: ['Perfil de luz', 'Luces LED'], sourcePages: '2 y 4' }),
];

export const getProduct = (id: string): Product => PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0]!;
