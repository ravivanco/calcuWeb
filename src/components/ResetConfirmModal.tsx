import { Dialog } from './Dialog';
export function ResetConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog title="Empezar un proyecto nuevo" open={open} onClose={onClose}><p className="dialog-intro">Se restablecerán las medidas y se eliminarán los cálculos acumulados en este navegador. Se conservarán los precios ingresados.</p><div className="dialog-actions"><button className="button-secondary" onClick={onClose}>Conservar proyecto</button><button className="button-primary" onClick={() => { onConfirm(); onClose(); }}>Empezar de nuevo</button></div></Dialog>;
}
