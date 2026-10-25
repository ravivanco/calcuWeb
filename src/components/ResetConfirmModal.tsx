import { Dialog } from './Dialog';
export function ResetConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog title="Nuevo cálculo" open={open} onClose={onClose}><p className="dialog-intro">Se restablecerán el material, las medidas y los complementos de este cálculo. El vendedor, los precios y el presupuesto guardado se conservarán.</p><div className="dialog-actions"><button className="button-secondary" onClick={onClose}>Cancelar</button><button className="button-primary" onClick={() => { onConfirm(); onClose(); }}>Crear nuevo cálculo</button></div></Dialog>;
}
