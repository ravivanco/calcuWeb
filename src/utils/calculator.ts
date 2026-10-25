import type { BudgetItem, CalculationResult, MaterialKind, MaterialQuantity, PriceList, Product, ProjectInput, QuoteLine } from '../types/calculator';
import { ADHESIVE_IDS, getAdhesiveRequirement, getInstallationOptions } from '../data/installation';
import { sellerById, sellerName } from '../data/sellers';
export const WASTE_PERCENT = 10 as const;
export const RULES_VERSION = 'fixed-waste-required-adhesive-v1';
export function parseUserNumber(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())) return NaN;
  const number = Number(value.trim().replace(',', '.'));
  return Number.isFinite(number) ? number : NaN;
}
export const formatNumber = (value: number, decimals = 2): string => Number.isFinite(value) ? new Intl.NumberFormat('es-EC', { maximumFractionDigits: decimals }).format(value) : '—';
export const formatCurrency = (value: number): string => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
export const unitLabel = (unit: string, quantity: number | null): string => quantity === 1 ? unit : ({ unidad: 'unidades', envase: 'envases', pieza: 'piezas', caja: 'cajas' }[unit] ?? unit + 's');
export const ceilQuantity = (value: number): number => Math.ceil(value - 1e-9);
const validNumber = (value: number, max = 1000) => Number.isFinite(value) && value > 0 && value <= max;
export function calculateProject(product: Product, input: ProjectInput): CalculationResult {
  const result: CalculationResult = { isValid: false, errors: [], grossAreaM2: 0, openingsAreaM2: 0, netAreaM2: 0, targetAreaM2: 0, basePieces: 0, unitsToBuy: 0, reserveUnits: 0, purchasedCoverageM2: 0, leftoverAreaM2: 0, wasteAreaM2: 0, roundingExcessM2: 0, cutExcessM2: 0, layout: [], accessories: [], warnings: [], pendingRequirements: [] };
  const errors = result.errors;
  if (input.productId !== product.id) errors.push('Selecciona una presentación válida.');
  if (input.sellerId !== null && !sellerById(input.sellerId)) errors.push('Selecciona un vendedor de la lista.');
  if (!['area', 'layout'].includes(input.mode)) errors.push('Selecciona un método de cálculo válido.');
  if (input.mode === 'layout' && (!product.widthM || !product.heightM)) errors.push('Esta presentación se calcula por área.');
  if (!validNumber(product.coverageM2, 1_000_000)) errors.push('La empresa debe configurar la cobertura del material.');
  if (!Array.isArray(input.surfaces) || !input.surfaces.length || input.surfaces.length > 50) errors.push('Agrega entre 1 y 50 superficies.');
  if (errors.length) return result;
  const ids = new Set<string>();
  let layoutPieces = 0;
  for (const [index, surface] of input.surfaces.entries()) {
    const label = surface?.name || `Superficie ${index + 1}`;
    if (!surface || !surface.id || ids.has(surface.id)) { errors.push('Cada superficie debe tener un identificador único.'); continue; }
    ids.add(surface.id);
    const direct = surface.measurementMode === 'area';
    if (surface.measurementMode && !['dimensions', 'area'].includes(surface.measurementMode)) { errors.push(`${label}: selecciona cómo ingresar las medidas.`); continue; }
    if (direct ? !validNumber(surface.areaM2!, 1_000_000) : !validNumber(surface.widthM) || !validNumber(surface.heightM)) { errors.push(`${label}: ingresa medidas mayores a cero.`); continue; }
    if (direct && input.mode === 'layout') { errors.push(`${label}: el despiece requiere ancho y alto.`); continue; }
    if (!['vertical', 'horizontal'].includes(surface.orientation)) { errors.push(`${label}: selecciona una orientación válida.`); continue; }
    if (!Array.isArray(surface.openings) || surface.openings.length > 50) { errors.push(`${label}: revisa las puertas y ventanas.`); continue; }
    const gross = direct ? surface.areaM2! : surface.widthM * surface.heightM;
    let openings = 0;
    for (const opening of surface.openings) {
      if (!opening || !validNumber(opening.widthM) || !validNumber(opening.heightM) || !Number.isInteger(opening.quantity) || !validNumber(opening.quantity)) { errors.push(`${label}: ingresa medidas positivas y una cantidad entera de aberturas.`); continue; }
      if (!direct && (opening.widthM > surface.widthM || opening.heightM > surface.heightM)) errors.push(`${label}: una abertura supera el ancho o alto disponible.`);
      openings += opening.widthM * opening.heightM * opening.quantity;
    }
    if (openings >= gross - 1e-9) errors.push(`${label}: las puertas y ventanas deben ocupar menos que la superficie.`);
    result.grossAreaM2 += gross;
    result.openingsAreaM2 += openings;
    if (input.mode === 'layout') {
      const columns = ceilQuantity(surface.widthM / (surface.orientation === 'horizontal' ? product.heightM! : product.widthM!));
      const rows = ceilQuantity(surface.heightM / (surface.orientation === 'horizontal' ? product.widthM! : product.heightM!));
      layoutPieces += columns * rows;
      result.layout.push({ surfaceId: surface.id, columns, rows });
    }
  }
  if (errors.length) return result;
  result.netAreaM2 = result.grossAreaM2 - result.openingsAreaM2;
  result.basePieces = input.mode === 'layout' ? layoutPieces : ceilQuantity(result.netAreaM2 / product.coverageM2);
  const baseCoverage = input.mode === 'layout' ? result.basePieces * product.coverageM2 : result.netAreaM2;
  result.wasteAreaM2 = baseCoverage * WASTE_PERCENT / 100;
  result.targetAreaM2 = baseCoverage + result.wasteAreaM2;
  result.unitsToBuy = input.mode === 'layout' ? ceilQuantity(result.basePieces * 1.1) : ceilQuantity(result.targetAreaM2 / product.coverageM2);
  result.reserveUnits = Math.max(0, result.unitsToBuy - result.basePieces);
  result.purchasedCoverageM2 = result.unitsToBuy * product.coverageM2;
  result.roundingExcessM2 = Math.max(0, result.purchasedCoverageM2 - result.targetAreaM2);
  result.cutExcessM2 = Math.max(0, baseCoverage - result.netAreaM2);
  result.leftoverAreaM2 = result.purchasedCoverageM2 - result.netAreaM2;
  const adhesive = getAdhesiveRequirement(product);
  if (adhesive.status !== 'not-required') {
    const rule = adhesive.rule;
    const exact = adhesive.status === 'confirmed' ? result.basePieces / rule.panelsPerUnit! : null;
    result.accessories.push({ id: rule.id, name: rule.name, unit: rule.unit, exactQuantity: exact, quantity: exact === null ? null : ceilQuantity(exact), available: rule.available !== false, sourceNote: rule.sourceNote, kind: 'adhesive', manual: false });
    if (exact === null) result.pendingRequirements.push(`${product.name}: ${rule.sourceNote}`);
  }
  const options = getInstallationOptions(product);
  const selection = input.accessorySelection ?? [];
  if (!Array.isArray(selection) || selection.length > options.length) { errors.push('Revisa los complementos seleccionados.'); return result; }
  const selected = new Set<string>();
  for (const item of selection) {
    const rule = item && options.find(option => option.id === item.id);
    if (!rule || selected.has(item.id) || ADHESIVE_IDS.has(item.id)) { errors.push('Selecciona complementos compatibles. El adhesivo se incluye automáticamente.'); continue; }
    selected.add(item.id);
    if (rule.manualQuantity && (!Number.isSafeInteger(item.quantity) || !validNumber(item.quantity!, 1_000_000))) { errors.push(`${rule.name}: ingresa una cantidad entera mayor a cero.`); continue; }
    if (!rule.manualQuantity && item.quantity !== undefined) { errors.push(`${rule.name}: su cantidad es automática.`); continue; }
    const exact = rule.manualQuantity ? item.quantity! : rule.panelsPerUnit ? result.basePieces / rule.panelsPerUnit : result.basePieces * (rule.unitsPerPanel ?? 0);
    result.accessories.push({ id: rule.id, name: rule.name, unit: rule.unit, exactQuantity: exact, quantity: ceilQuantity(exact), available: rule.available !== false, sourceNote: rule.sourceNote, kind: 'accessory', manual: !!rule.manualQuantity });
  }
  if (errors.length) return result;
  result.warnings = [...product.technicalNotes];
  if (input.mode === 'layout') result.warnings.push('Despiece conservador: las aberturas reducen el área, no las piezas; no se reutilizan recortes.');
  else result.warnings.push('Estimación por área. Confirma el despiece con instalación.');
  if (result.accessories.some(a => a.kind === 'adhesive')) result.warnings.push('Adhesivo sobre piezas base, sin reserva. Rendimientos asociados por orden de filas del manual.');
  if (result.accessories.some(a => a.manual)) result.warnings.push('Complementos con cantidad manual: presentación y consumo por confirmar.');
  if (result.openingsAreaM2) result.warnings.push('Confirma que las aberturas no se solapen.');
  result.isValid = Number.isSafeInteger(result.unitsToBuy) && result.unitsToBuy > 0;
  if (!result.isValid) errors.push('Las medidas superan el rango de cálculo.');
  return result;
}
export function buildQuote(items: BudgetItem[], prices: PriceList): QuoteLine[] {
  const entries = new Map<string, Omit<QuoteLine, 'unitPriceUSD' | 'subtotalUSD'>>();
  for (const item of items.filter(item => item.result.isValid)) {
    const seller = sellerName(item.input.sellerId);
    const add = (id: string, priceId: string, name: string, unit: string, quantity: number | null, available: boolean, kind: MaterialKind, note: string) => {
      const previous = entries.get(id);
      entries.set(id, { id, priceId, name, unit, quantity: quantity === null || previous?.quantity === null ? null : quantity + (previous?.quantity ?? 0), available, isAccessory: kind !== 'main', kind, note: [...new Set([previous?.note, note].filter(Boolean))].join(' '), sellerNames: [...new Set([...(previous?.sellerNames ?? []), seller])], ...(kind === 'main' ? { netAreaM2: (previous?.netAreaM2 ?? 0) + item.result.netAreaM2, purchasedCoverageM2: (previous?.purchasedCoverageM2 ?? 0) + item.result.purchasedCoverageM2, wasteAreaM2: (previous?.wasteAreaM2 ?? 0) + item.result.wasteAreaM2, roundingExcessM2: (previous?.roundingExcessM2 ?? 0) + item.result.roundingExcessM2 } : {}) });
    };
    add(item.product.id, item.product.id, item.product.name, item.product.saleUnit, item.result.unitsToBuy, true, 'main', '10% de desperdicio incluido.');
    item.result.accessories.forEach((accessory: MaterialQuantity) => add(accessory.quantity === null ? `pending:${item.product.id}:${accessory.id}` : accessory.id, accessory.id, accessory.name, accessory.unit, accessory.exactQuantity, accessory.available, accessory.kind, accessory.sourceNote));
  }
  return [...entries.values()].map(entry => {
    const quantity = entry.quantity === null ? null : ceilQuantity(entry.quantity);
    const price = prices[entry.priceId];
    const unitPriceUSD = entry.available && Number.isFinite(price) && price >= 0 && price <= 1_000_000 ? price : null;
    return { ...entry, quantity, unitPriceUSD, subtotalUSD: quantity === null || unitPriceUSD === null ? null : Math.round(quantity * unitPriceUSD * 100) / 100 };
  });
}
export function quoteTotals(lines: QuoteLine[]) {
  const priced = lines.filter(line => line.subtotalUSD !== null);
  const pending = lines.filter(line => line.quantity === null);
  const missing = lines.filter(line => line.unitPriceUSD === null);
  const unassignedSeller = lines.some(line => line.sellerNames.includes('Sin asignar'));
  return { amount: Math.round(priced.reduce((sum, line) => sum + line.subtotalUSD!, 0) * 100) / 100, hasPrices: priced.length > 0, incomplete: pending.length > 0 || missing.length > 0 || !lines.length || unassignedSeller, pendingCount: pending.length, missingPriceCount: missing.length, unassignedSeller };
}
export function quoteToCsv(lines: QuoteLine[]): string {
  const escape = (value: unknown) => '"' + String(value ?? '').replace(/^[\s]*[=+@\-]/, "'$&").replace(/"/g, '""') + '"';
  const rows: unknown[][] = [['Vendedor', 'Material', 'Cantidad', 'Unidad', 'Precio unitario USD', 'Subtotal USD', 'Estado', 'Desperdicio %', 'Área neta m²', 'Cobertura comprada m²', 'Desperdicio m²', 'Excedente por redondeo m²', 'Observaciones'], ...lines.map(line => [line.sellerNames.join(' / '), line.name, line.quantity, line.unit, line.unitPriceUSD, line.subtotalUSD, line.quantity === null ? 'Adhesivo por confirmar' : !line.available ? 'No disponible según manual' : line.unitPriceUSD === null ? 'Por cotizar' : 'Con precio', WASTE_PERCENT, line.netAreaM2, line.purchasedCoverageM2, line.wasteAreaM2, line.roundingExcessM2, line.note])];
  return '\uFEFF' + rows.map(row => row.map(escape).join(';')).join('\r\n');
}
export function exportQuoteCsv(lines: QuoteLine[]): void {
  const url = URL.createObjectURL(new Blob([quoteToCsv(lines)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = 'cotizacion-decokasa.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
