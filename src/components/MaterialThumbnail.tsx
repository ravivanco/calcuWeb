import type { FamilyId } from '../types/calculator';
export function MaterialThumbnail({ family, className = '' }: { family: FamilyId; className?: string }) {
  return <span className={`material-thumbnail family-${family} ${className}`} role="img" aria-label="Muestra de material ilustrativa"/>;
}
