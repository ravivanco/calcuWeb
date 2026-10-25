import { CATALOG_VERSION, PRODUCTS, getProduct } from '../data/catalog';
import { ADHESIVE_IDS, getInstallationOptions } from '../data/installation';
import { sellerById } from '../data/sellers';
import { calculateProject, RULES_VERSION } from './calculator';
import type { AccessorySelection, BudgetItem, PriceList, ProjectInput, ProjectSurface } from '../types/calculator';
export const STORAGE_KEY = 'decokasa_workspace_v2';
export const newId = () => globalThis.crypto?.randomUUID?.() ?? `dk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const getDefaultInput = (productId = PRODUCTS[0]!.id): ProjectInput => ({ productId, sellerId: null, mode: 'area', accessorySelection: [], surfaces: [{ id: newId(), name: 'Superficie 1', widthM: 3.5, heightM: 2.6, orientation: 'vertical', measurementMode: 'dimensions', openings: [] }] });
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
export function isProjectInput(value: unknown): value is ProjectInput {
  if (!record(value) || !PRODUCTS.some(p => p.id === value.productId) || (value.sellerId !== null && !sellerById(String(value.sellerId))) || !['area', 'layout'].includes(String(value.mode)) || !Array.isArray(value.surfaces) || !value.surfaces.length || value.surfaces.length > 50 || !Array.isArray(value.accessorySelection) || value.accessorySelection.length > 100) return false;
  if (!value.accessorySelection.every(s => record(s) && typeof s.id === 'string' && (s.quantity === undefined || finite(s.quantity)))) return false;
  return value.surfaces.every(s => record(s) && typeof s.id === 'string' && typeof s.name === 'string' && finite(s.widthM) && finite(s.heightM) && [undefined, 'dimensions', 'area'].includes(s.measurementMode as undefined | string) && (s.areaM2 === undefined || finite(s.areaM2)) && (s.measurementMode !== 'area' || finite(s.areaM2)) && ['vertical', 'horizontal'].includes(String(s.orientation)) && Array.isArray(s.openings) && s.openings.length <= 50 && s.openings.every(o => record(o) && typeof o.id === 'string' && typeof o.name === 'string' && finite(o.widthM) && finite(o.heightM) && finite(o.quantity)));
}
function normalizeInput(value: unknown): ProjectInput | null {
  if (!record(value) || !PRODUCTS.some(p => p.id === value.productId)) return null;
  const product = getProduct(String(value.productId));
  const options = getInstallationOptions(product);
  const rawSelection = value.accessorySelection === undefined ? product.accessoryRules.filter(rule => !ADHESIVE_IDS.has(rule.id)).map(rule => ({ id: rule.id })) : value.accessorySelection;
  if (!Array.isArray(rawSelection)) return null;
  const selection: AccessorySelection[] = [];
  for (const item of rawSelection) {
    if (!record(item) || typeof item.id !== 'string') return null;
    if (ADHESIVE_IDS.has(item.id)) continue;
    const rule = options.find(option => option.id === item.id);
    if (!rule) continue;
    selection.push({ id: item.id, ...(rule.manualQuantity && item.quantity !== undefined ? { quantity: item.quantity as number } : {}) });
  }
  const input = { productId: product.id, sellerId: typeof value.sellerId === 'string' ? sellerById(value.sellerId)?.id ?? null : null, mode: value.mode === 'layout' ? 'layout' : 'area', surfaces: value.surfaces, accessorySelection: selection };
  return isProjectInput(input) ? structuredClone(input) : null;
}
export interface WorkspaceState { input: ProjectInput; items: BudgetItem[]; prices: PriceList; notice: string }
export function decodeWorkspace(value: unknown): WorkspaceState {
  const fallback: WorkspaceState = { input: getDefaultInput(), items: [], prices: {}, notice: '' };
  if (value === null) return fallback;
  if (!record(value) || value.version !== CATALOG_VERSION) return { ...fallback, notice: 'Los datos guardados no son compatibles con este catálogo.' };
  const restored = normalizeInput(value.input);
  const items: BudgetItem[] = [];
  let skipped = 0;
  if (Array.isArray(value.items)) for (const item of value.items.slice(0, 100)) {
    if (!record(item) || typeof item.id !== 'string' || typeof item.createdAt !== 'string') { skipped++; continue; }
    const input = normalizeInput(item.input);
    if (!input) { skipped++; continue; }
    const product = getProduct(input.productId);
    const result = calculateProject(product, input);
    if (result.isValid) items.push({ id: item.id, createdAt: item.createdAt, input, product, result }); else skipped++;
  }
  const knownIds = new Set(PRODUCTS.flatMap(p => [p.id, ...p.accessoryRules.map(a => a.id), ...getInstallationOptions(p).map(a => a.id)]));
  const prices: PriceList = {};
  if (record(value.prices)) for (const [id, price] of Object.entries(value.prices)) {
    if (knownIds.has(id) && finite(price) && price >= 0 && price <= 1_000_000 && Math.abs(price * 100 - Math.round(price * 100)) < 1e-7) prices[id] = price;
  }
  const migrated = value.rulesVersion !== RULES_VERSION;
  return { input: restored ?? fallback.input, items, prices, notice: !restored ? 'Se recuperaron las cotizaciones y precios válidos. Ingresa nuevamente las medidas.' : migrated && items.length ? 'Cotizaciones actualizadas: 10% fijo y adhesivo incluido. Revisa el vendedor de los registros anteriores.' : skipped ? 'Se omitieron cálculos guardados con medidas incompletas.' : '' };
}
export function encodeWorkspace(state: Pick<WorkspaceState, 'input' | 'items' | 'prices'>): string {
  return JSON.stringify({ version: CATALOG_VERSION, schemaVersion: 3, rulesVersion: RULES_VERSION, ...state });
}
export function withMeasurement(input: ProjectInput, surfaceId: string, changes: Partial<ProjectSurface>): ProjectInput {
  return { ...input, ...(changes.measurementMode === 'area' ? { mode: 'area' as const } : {}), surfaces: input.surfaces.map(surface => surface.id === surfaceId ? { ...surface, ...changes } : surface) };
}
