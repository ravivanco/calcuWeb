import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Dialog({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className={`dialog ${wide ? 'dialog-wide' : ''}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) { const b = event.currentTarget.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) onClose(); } }} aria-labelledby={`dialog-${title.replace(/\s/g, '')}`}>
    <div className="dialog-heading"><h2 id={`dialog-${title.replace(/\s/g, '')}`}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar ventana" autoFocus><X size={20} /></button></div>
    {children}
  </dialog>;
}
