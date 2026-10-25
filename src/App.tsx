import { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { RotateCcw, X } from 'lucide-react';
import { useProjectStorage } from './hooks/useProjectStorage';
import { getProduct } from './data/catalog';
import { buildQuote, calculateProject } from './utils/calculator';
import type { BudgetItem } from './types/calculator';
import { Header } from './components/Header';
import { ProductSelector } from './components/ProductSelector';
import { ProjectForm } from './components/ProjectForm';
import { ResultsSummary } from './components/ResultsSummary';
import { InstallationOptions } from './components/InstallationOptions';
import { BudgetModal } from './components/BudgetModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PrintQuotationView } from './components/PrintQuotationView';

export default function App() {
  const state = useProjectStorage();
  const { projectInput: input, setProjectInput, budgetItems, prices } = state;
  const product = getProduct(input.productId);
  const result = useMemo(() => calculateProject(product, input), [product, input]);
  const current = useMemo<BudgetItem[]>(() => result.isValid ? [{ id: 'actual', createdAt: new Date().toISOString(), input, product, result }] : [], [input, product, result]);
  const currentLines = useMemo(() => buildQuote(current, prices), [current, prices]);
  const budgetLines = useMemo(() => buildQuote(budgetItems, prices), [budgetItems, prices]);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [printScope, setPrintScope] = useState<'current' | 'budget'>('current');
  const [announcement, setAnnouncement] = useState('');
  const print = (scope: 'current' | 'budget') => { flushSync(() => { setPrintScope(scope); setBudgetOpen(false); }); window.print(); };
  const add = () => { const ok = state.addToBudget(); if (ok) setBudgetOpen(true); setAnnouncement(ok ? `Cálculo añadido. ${budgetItems.length + 1} en tu presupuesto.` : 'Revisa las medidas o el límite de 100 cálculos.'); return ok; };
  return <><a className="skip-link" href="#calculadora">Ir a la calculadora</a>
    <PrintQuotationView items={printScope === 'current' ? current : budgetItems} lines={printScope === 'current' ? currentLines : budgetLines} scope={printScope}/>
    <div className="screen-app"><Header/>
      <main id="calculadora" className="calculator-wrapper"><div className="workspace-toolbar"><div><h1>Calcula tus materiales</h1><p>Elige el material, ingresa las medidas y prepara tu presupuesto.</p></div><button className="text-button" aria-label="Nuevo cálculo" onClick={() => setResetOpen(true)}><RotateCcw size={15}/> Nuevo cálculo</button></div>
        {state.storageNotice && <div className="storage-notice" role="status"><p>{state.storageNotice}</p><button className="icon-button" aria-label="Cerrar aviso" onClick={state.dismissNotice}><X size={16}/></button></div>}
        <div className="calculator-layout"><div className="workspace-main">
          <ProductSelector selectedProductId={product.id} onSelectProduct={state.selectProduct} price={prices[product.id]} onPrice={state.setPrice}/>
          <ProjectForm product={product} input={input} onChangeInput={setProjectInput} result={result}/>
          <InstallationOptions product={product} input={input} onChangeInput={setProjectInput} result={result} prices={prices} onPrice={state.setPrice}/>
        </div><ResultsSummary product={product} result={result} lines={currentLines} wastePercent={input.wastePercent} onAdd={add} onPrint={() => print('current')}/></div>
      </main>
      <footer className="site-footer"><span>DECOKASA</span><span>Guardado en este navegador</span></footer>
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
      <BudgetModal open={budgetOpen} onClose={() => setBudgetOpen(false)} items={budgetItems} lines={budgetLines} prices={prices} vendorMode onPrice={state.setPrice} onRemove={state.removeBudgetItem} onClear={state.clearBudget} onPrint={() => print('budget')} onLoad={item => { setProjectInput({ ...structuredClone(item.input), mode: 'area', wastePercent: item.input.wastePercent === 5 ? 5 : 10 }); setAnnouncement('Medidas recuperadas.'); }}/>
      <ResetConfirmModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={state.resetProject}/>
    </div>
  </>;
}
