import type { ReactNode } from 'react';
export function SectionHeading({ number, title, detail, id }: { number: string; title: string; detail?: ReactNode; id: string }) {
  return <div className="section-heading"><span className="section-number" aria-hidden="true">{number}</span><h2 id={id}>{title}</h2>{detail && <span className="section-detail">{detail}</span>}</div>;
}
