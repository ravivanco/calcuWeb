import { useEffect, useState } from 'react';
import { CATALOG_VERSION, getProduct, PRODUCTS } from '../data/catalog';
import { calculateProject } from '../utils/calculator';
import type { BudgetItem, PriceList, ProjectInput } from '../types/calculator';

const KEY = 'decokasa_workspace_v2';
export const newId = () => crypto.randomUUID();
export function getDefaultInput(productId = PRODUCTS[0]!.id): ProjectInput {
  return { productId, projectName: 'Mi proyecto', customerName: '', wastePercent: 10, mode: 'area', accessorySelection: [],
    surfaces: [{ id: newId(), name: 'Superficie principal', widthM: 3.5, heightM: 2.6, orientation: 'vertical', openings: [] }] };
}
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function isProjectInput(v: unknown): v is ProjectInput {
  if (record(v) && v.accessorySelection !== undefined && (!Array.isArray(v.accessorySelection) || v.accessorySelection.length > 100 || !v.accessorySelection.every(s => record(s) && typeof s.id === 'string' && (s.quantity === undefined || (typeof s.quantity === 'number' && Number.isFinite(s.quantity)))))) return false;
  const validMeasurement = (s: Record<string, unknown>) =>
    (s.measurementMode === undefined || s.measurementMode === 'dimensions' || s.measurementMode === 'area') &&
    (s.areaM2 === undefined || (typeof s.areaM2 === 'number' && Number.isFinite(s.areaM2))) &&
    (s.measurementMode !== 'area' || typeof s.areaM2 === 'number');
  if (!record(v) || !PRODUCTS.some(p => p.id === v.productId) || typeof v.projectName !== 'string' || typeof v.customerName !== 'string' || typeof v.wastePercent !== 'number' || !Number.isFinite(v.wastePercent) || !['area', 'layout'].includes(String(v.mode)) || !Array.isArray(v.surfaces) || v.surfaces.length < 1 || v.surfaces.length > 50) return false;
  return v.surfaces.every(s => record(s) && validMeasurement(s) && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.widthM === 'number' && Number.isFinite(s.widthM) && typeof s.heightM === 'number' && Number.isFinite(s.heightM) && ['vertical', 'horizontal'].includes(String(s.orientation)) && Array.isArray(s.openings) && s.openings.length <= 50 && s.openings.every(o => record(o) && typeof o.id === 'string' && typeof o.name === 'string' && typeof o.widthM === 'number' && Number.isFinite(o.widthM) && typeof o.heightM === 'number' && Number.isFinite(o.heightM) && typeof o.quantity === 'number' && Number.isFinite(o.quantity)));
}
function initialState() {
  const fallback = { input: getDefaultInput(), items: [] as BudgetItem[], prices: {} as PriceList, notice: '' };
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return fallback;
    const data: unknown = JSON.parse(saved);
    if (!record(data) || data.version !== CATALOG_VERSION || !Array.isArray(data.items) || !record(data.prices)) return { ...fallback, notice: 'Los datos guardados no son compatibles. Se inició un proyecto nuevo.' };
    const inputValid = isProjectInput(data.input);
    const restoredInput = inputValid ? data.input as ProjectInput : fallback.input;
    const items: BudgetItem[] = [];
    let skipped = 0;
    for (const item of data.items.slice(0, 100)) {
      if (!record(item) || typeof item.id !== 'string' || typeof item.createdAt !== 'string' || !isProjectInput(item.input)) { skipped++; continue; }
      const product = getProduct(item.input.productId);
      const result = calculateProject(product, item.input);
      if (result.isValid) items.push({ id: item.id, createdAt: item.createdAt, input: item.input, product, result }); else skipped++;
    }
    const prices: PriceList = {};
    for (const [id, price] of Object.entries(data.prices)) if (typeof price === 'number' && Number.isFinite(price) && price >= 0 && price <= 1_000_000) prices[id] = price;
    return { input: { ...restoredInput, mode: 'area' as const, wastePercent: restoredInput.wastePercent === 5 ? 5 : 10 }, items, prices, notice: !inputValid ? 'Se restablecieron las medidas. Se conservaron los cálculos y precios válidos.' : skipped ? 'Se omitieron partidas guardadas con datos incompletos.' : '' };
  } catch { return { ...fallback, notice: 'No se pudieron recuperar los datos locales. Puedes continuar con un proyecto nuevo.' }; }
}
export function useProjectStorage() {
  const [loaded] = useState(initialState);
  const [projectInput, setProjectInput] = useState(loaded.input);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(loaded.items);
  const [prices, setPrices] = useState<PriceList>(loaded.prices);
  const [storageNotice, setStorageNotice] = useState(loaded.notice);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ version: CATALOG_VERSION, input: projectInput, items: budgetItems, prices })); }
    catch { setStorageNotice('El navegador no permite guardar. Los cambios se conservan solo mientras esta página siga abierta.'); }
  }, [projectInput, budgetItems, prices]);
  const selectProduct = (id: string) => setProjectInput(prev => ({ ...prev, productId: id, mode: 'area', accessorySelection: [] }));
  const addToBudget = () => {
    if (budgetItems.length >= 100) return false;
    const product = getProduct(projectInput.productId);
    const result = calculateProject(product, projectInput);
    if (!result.isValid) return false;
    setBudgetItems(prev => [...prev, structuredClone({ id: newId(), createdAt: new Date().toISOString(), input: projectInput, product, result })]);
    return true;
  };
  const setPrice = (id: string, value: string) => setPrices(prev => {
    const updated = { ...prev };
    if (value.trim() === '') delete updated[id];
    else { const n = Number(value.replace(',', '.')); if (Number.isFinite(n) && n >= 0 && n <= 1_000_000) updated[id] = Math.round(n * 100) / 100; }
    return updated;
  });
  const resetProject = () => { setProjectInput(getDefaultInput()); setBudgetItems([]); setStorageNotice(''); };
  return { projectInput, setProjectInput, budgetItems, prices, setPrice, selectProduct, addToBudget, resetProject,
    removeBudgetItem: (id: string) => setBudgetItems(prev => prev.filter(item => item.id !== id)), clearBudget: () => setBudgetItems([]),
    storageNotice, dismissNotice: () => setStorageNotice('') };
}
