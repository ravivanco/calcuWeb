import { FileText, RotateCcw } from 'lucide-react';
export function Header({ onReset }: { onReset: () => void }) {
  return <header className="site-header"><a className="brand" href="#calculadora" aria-label="DECOKASA inicio">decokasa<span>.</span></a><span className="header-label">Cotizaciones</span><div className="header-actions"><a className="icon-button" href="/documentos/Manual_Tecnico_Comercial_DECOKASA.pdf" target="_blank" rel="noreferrer" aria-label="Consultar manual técnico"><FileText size={18}/></a><button className="button-quiet" onClick={onReset}><RotateCcw size={16} aria-hidden="true"/><span>Nuevo cálculo</span></button></div></header>;
}
