import { useEffect, useState } from 'react';
import { getProduct } from '../data/catalog';
import { sellerById } from '../data/sellers';
import { calculateProject, parseUserNumber } from '../utils/calculator';
import { decodeWorkspace, encodeWorkspace, getDefaultInput, newId, STORAGE_KEY } from '../utils/storage';
import type { BudgetItem, PriceList } from '../types/calculator';
export { getDefaultInput, newId, isProjectInput } from '../utils/storage';
function readWorkspace() {
  try { const saved = localStorage.getItem(STORAGE_KEY); return decodeWorkspace(saved ? JSON.parse(saved) : null); }
  catch { return { ...decodeWorkspace(null), notice: 'No se pudieron recuperar los datos locales. Puedes continuar con un cálculo nuevo.' }; }
}
export function useProjectStorage() {
  const [loaded] = useState(readWorkspace);
  const [projectInput, setProjectInput] = useState(loaded.input);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(loaded.items);
  const [prices, setPrices] = useState<PriceList>(loaded.prices);
  const [storageNotice, setStorageNotice] = useState(loaded.notice);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, encodeWorkspace({ input: projectInput, items: budgetItems, prices })); }
    catch { setStorageNotice('No se puede guardar en este navegador. Descarga tu cotización antes de cerrar.'); }
  }, [projectInput, budgetItems, prices]);
  const selectProduct = (id: string) => setProjectInput(prev => ({ ...prev, productId: id, mode: 'area', accessorySelection: [] }));
  const addToBudget = () => {
    if (!sellerById(projectInput.sellerId) || budgetItems.length >= 100) return false;
    const product = getProduct(projectInput.productId);
    const result = calculateProject(product, projectInput);
    if (!result.isValid) return false;
    const item = structuredClone({ id: newId(), createdAt: new Date().toISOString(), input: projectInput, product, result });
    setBudgetItems(prev => [...prev, item]);
    return true;
  };
  const setPrice = (id: string, value: string) => setPrices(prev => {
    const updated = { ...prev };
    const price = parseUserNumber(value);
    if (!/^\d+(?:[.,]\d{0,2})?$/.test(value.trim()) || !Number.isFinite(price) || price < 0 || price > 1_000_000) delete updated[id];
    else updated[id] = Math.round(price * 100) / 100;
    return updated;
  });
  const resetProject = () => { setProjectInput(previous => ({ ...getDefaultInput(), sellerId: previous.sellerId })); setStorageNotice(''); };
  return { projectInput, setProjectInput, budgetItems, prices, setPrice, selectProduct, addToBudget, resetProject,
    removeBudgetItem: (id: string) => setBudgetItems(prev => prev.filter(item => item.id !== id)), clearBudget: () => setBudgetItems([]),
    storageNotice, dismissNotice: () => setStorageNotice('') };
}
