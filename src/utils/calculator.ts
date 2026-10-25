import type { BudgetItem, CalculationResult, MaterialQuantity, PriceList, Product, ProjectInput, QuoteLine } from '../types/calculator';
import { getInstallationOptions } from '../data/installation';

export function parseUserNumber(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const text = value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) return NaN;
  const n = Number(text.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}
export const formatNumber = (value: number, decimals = 2): string => Number.isFinite(value) ? new Intl.NumberFormat('es-EC', { maximumFractionDigits: decimals }).format(value) : '—';
export const formatCurrency = (value: number): string => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
export const unitLabel = (unit: string, quantity: number): string => quantity === 1 ? unit : ({ unidad: 'unidades', envase: 'envases', pieza: 'piezas', caja: 'cajas' }[unit] ?? unit + 's');
export const ceilQuantity = (value: number): number => Math.ceil(value - 1e-9);

export function calculateProject(product: Product, input: ProjectInput): CalculationResult {
  const result: CalculationResult = { isValid: false, errors: [], grossAreaM2: 0, openingsAreaM2: 0, netAreaM2: 0, targetAreaM2: 0, basePieces: 0, unitsToBuy: 0, reserveUnits: 0, purchasedCoverageM2: 0, leftoverAreaM2: 0, layout: [], accessories: [], warnings: [], steps: [] };
  const errors = result.errors;
  if (!Number.isFinite(input.wastePercent) || input.wastePercent < 0 || input.wastePercent > 50) errors.push('El margen de reserva debe estar entre 0 y 50%.');
  if (input.productId !== product.id) errors.push('El producto del proyecto no coincide con el seleccionado.');
  if (!['area', 'layout'].includes(input.mode)) errors.push('Selecciona un método de cálculo válido.');
  if (input.mode === 'layout' && (!product.widthM || !product.heightM)) errors.push('Esta presentación solo permite calcular por área.');
  if (!Number.isFinite(product.coverageM2) || product.coverageM2 <= 0) errors.push('La cobertura del producto no es válida.');
  if (!Array.isArray(input.surfaces) || !input.surfaces.length || input.surfaces.length > 50) errors.push('Define entre 1 y 50 superficies.');
  if (errors.length) return result;
  let layoutPieces = 0;
  const positive = (v: number) => Number.isFinite(v) && v > 0 && v <= 1000;
  const surfaceIds = new Set<string>();
  for (const [i, surface] of input.surfaces.entries()) {
    const label = surface.name || `Superficie ${i + 1}`;
    if (!surface.id || surfaceIds.has(surface.id)) errors.push('Cada superficie debe tener un identificador único.');
    surfaceIds.add(surface.id);
    const directArea = surface.measurementMode === 'area';
    if (surface.measurementMode !== undefined && !['dimensions', 'area'].includes(surface.measurementMode)) { errors.push(`${label}: selecciona cómo ingresar la superficie.`); continue; }
    if (directArea) {
      if (!Number.isFinite(surface.areaM2) || surface.areaM2! <= 0 || surface.areaM2! > 1_000_000) { errors.push(`${label}: ingresa un área mayor a 0 y hasta 1.000.000 m².`); continue; }
      if (input.mode === 'layout') { errors.push(`${label}: el cálculo por piezas requiere ancho y alto.`); continue; }
    } else if (!positive(surface.widthM) || !positive(surface.heightM)) { errors.push(`${label}: ingresa ancho y alto mayores a 0 y hasta 1000 m.`); continue; }
    if (!['vertical', 'horizontal'].includes(surface.orientation)) { errors.push(`${label}: selecciona una orientación válida.`); continue; }
    if (!Array.isArray(surface.openings) || surface.openings.length > 50) { errors.push(`${label}: revisa las aberturas.`); continue; }
    const gross = directArea ? surface.areaM2! : surface.widthM * surface.heightM;
    let openings = 0;
    for (const opening of surface.openings) {
      if (!positive(opening.widthM) || !positive(opening.heightM) || !Number.isInteger(opening.quantity) || opening.quantity < 1 || opening.quantity > 1000) { errors.push(`${label}: revisa las medidas y la cantidad entera de puertas o ventanas.`); continue; }
      if (!directArea && (opening.widthM > surface.widthM || opening.heightM > surface.heightM)) errors.push(`${label}: una abertura excede las dimensiones de la superficie.`);
      openings += opening.widthM * opening.heightM * opening.quantity;
    }
    if (openings >= gross - 1e-9) errors.push(`${label}: las aberturas deben ocupar menos que la superficie completa.`);
    result.grossAreaM2 += gross;
    result.openingsAreaM2 += openings;
    if (input.mode === 'layout') {
      const width = surface.orientation === 'horizontal' ? product.heightM! : product.widthM!;
      const height = surface.orientation === 'horizontal' ? product.widthM! : product.heightM!;
      const columns = ceilQuantity(surface.widthM / width);
      const rows = ceilQuantity(surface.heightM / height);
      layoutPieces += columns * rows;
      result.layout.push({ surfaceId: surface.id, columns, rows });
    }
  }
  if (errors.length) return result;
  result.netAreaM2 = result.grossAreaM2 - result.openingsAreaM2;
  result.targetAreaM2 = result.netAreaM2 * (1 + input.wastePercent / 100);
  result.basePieces = input.mode === 'layout' ? layoutPieces : ceilQuantity(result.netAreaM2 / product.coverageM2);
  result.unitsToBuy = input.mode === 'layout' ? ceilQuantity(layoutPieces * (1 + input.wastePercent / 100)) : ceilQuantity(result.targetAreaM2 / product.coverageM2);
  result.reserveUnits = Math.max(0, result.unitsToBuy - result.basePieces);
  result.purchasedCoverageM2 = result.unitsToBuy * product.coverageM2;
  result.leftoverAreaM2 = Math.max(0, result.purchasedCoverageM2 - result.netAreaM2);
  // Consumables are based on the estimated installed pieces, excluding reserve.
  const options = getInstallationOptions(product);
  const selection: NonNullable<ProjectInput['accessorySelection']> = input.accessorySelection ?? product.accessoryRules.map(rule => ({ id: rule.id }));
  if (!Array.isArray(selection) || selection.length > options.length) { errors.push('Revisa los complementos seleccionados.'); return result; }
  const selectedIds = new Set<string>();
  for (const item of selection) {
    const option = item && options.find(o => o.id === item.id);
    if (!option || selectedIds.has(item.id)) { errors.push('Selecciona complementos válidos para este material.'); continue; }
    selectedIds.add(item.id);
    if (option.manualQuantity && (!Number.isSafeInteger(item.quantity) || item.quantity! < 1 || item.quantity! > 1_000_000)) errors.push(`${option.name}: ingresa una cantidad entera entre 1 y 1.000.000.`);
    if (!option.manualQuantity && item.quantity !== undefined) errors.push(`${option.name}: la cantidad se calcula con el rendimiento del catálogo.`);
  }
  if (errors.length) return result;
  result.accessories = selection.map(item => {
    const rule = options.find(o => o.id === item.id)!;
    const exactQuantity = rule.manualQuantity ? item.quantity! : rule.panelsPerUnit ? result.basePieces / rule.panelsPerUnit : result.basePieces * (rule.unitsPerPanel ?? 0);
    return { id: rule.id, name: rule.name, unit: rule.unit, exactQuantity, quantity: ceilQuantity(exactQuantity), available: rule.available !== false, sourceNote: rule.sourceNote };
  });
  result.warnings = [...product.technicalNotes];
  if (input.mode === 'layout') {
    result.warnings.push('Despiece conservador por rectángulo completo. No reutiliza recortes, incluso dentro de la misma superficie.');
    if (result.openingsAreaM2 > 0) result.warnings.push('Las puertas y ventanas reducen el área, pero no las piezas del despiece. Para optimizar cortes se necesita revisar su posición con un instalador.');
  } else result.warnings.push('Estimación por área. La distribución real de cortes puede cambiar la cantidad de piezas.');
  if (result.accessories.some(a => options.find(o => o.id === a.id)?.manualQuantity)) result.warnings.push('Algunos complementos tienen cantidades ingresadas manualmente. Confirma presentación y cantidad con el instalador.');
  if (selection.some(item => !options.find(o => o.id === item.id)!.manualQuantity)) result.warnings.push('Insumos calculados sobre las piezas base, sin la reserva. Rendimientos asociados por orden de filas del manual; confirma montaje y presentación del envase.');
  if (result.openingsAreaM2 > 0) result.warnings.push('Las aberturas se suman por área. Comprueba que no se solapen entre sí.');
  result.steps = [
    `Área neta: ${formatNumber(result.grossAreaM2, 4)} − ${formatNumber(result.openingsAreaM2, 4)} = ${formatNumber(result.netAreaM2, 4)} m².`,
    input.mode === 'layout' ? `Piezas base: suma de columnas × filas por superficie = ${result.basePieces}. Compra: redondear arriba ${result.basePieces} × ${formatNumber(1 + input.wastePercent / 100, 4)} = ${result.unitsToBuy}.` : `Compra: redondear arriba (${formatNumber(result.netAreaM2, 4)} × ${formatNumber(1 + input.wastePercent / 100, 4)}) / ${formatNumber(product.coverageM2, 4)} = ${result.unitsToBuy} ${unitLabel(product.saleUnit, result.unitsToBuy)}.`,
    'Los formatos usan su área geométrica exacta. Las coberturas publicadas en el manual pueden estar redondeadas. Las cajas de piso cubren 5 m².',
  ];
  result.isValid = result.unitsToBuy > 0 && Number.isSafeInteger(result.unitsToBuy);
  if (!result.isValid) result.errors.push('Las medidas producen una cantidad fuera del rango de cálculo.');
  return result;
}

export function buildQuote(items: BudgetItem[], prices: PriceList): QuoteLine[] {
  const entries = new Map<string, { name: string; unit: string; quantity: number; available: boolean; isAccessory: boolean }>();
  const add = (id: string, name: string, unit: string, quantity: number, available: boolean, isAccessory: boolean) => {
    const current = entries.get(id);
    entries.set(id, { name, unit, quantity: quantity + (current?.quantity ?? 0), available, isAccessory });
  };
  items.filter(item => item.result.isValid).forEach(item => {
    add(item.product.id, item.product.name, item.product.saleUnit, item.result.unitsToBuy, true, false);
    item.result.accessories.forEach((a: MaterialQuantity) => add(a.id, a.name, a.unit, a.exactQuantity, a.available, true));
  });
  return [...entries].map(([id, item]) => {
    const quantity = ceilQuantity(item.quantity);
    const price = prices[id];
    const unitPriceUSD = item.available && Number.isFinite(price) && price >= 0 && price <= 1_000_000 ? price : null;
    return { id, ...item, quantity, unitPriceUSD, subtotalUSD: unitPriceUSD === null ? null : Math.round(quantity * unitPriceUSD * 100) / 100 };
  });
}

export function exportQuoteCsv(lines: QuoteLine[]): void {
  const escape = (v: string | number | null) => '"' + String(v ?? '').replace(/^[=+@\-]/, "'$&").replace(/"/g, '""') + '"';
  const rows: (string | number | null)[][] = [['Material', 'Cantidad', 'Unidad', 'Precio unitario USD', 'Subtotal USD', 'Disponibilidad'], ...lines.map(l => [l.name, l.quantity, l.unit, l.unitPriceUSD, l.subtotalUSD, l.available ? 'Confirmar en local' : 'No disponible según manual'])];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(r => r.map(escape).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = 'materiales-decokasa.csv'; link.click(); URL.revokeObjectURL(url);
}
