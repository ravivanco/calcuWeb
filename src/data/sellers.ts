const NAMES = [
  'Marlon Quishpe', 'Cinthya García', 'Keyssi Ruiz', 'Jessica Guevara', 'Alejandro Revelo',
  'Salomé Benavides', 'Nataly Franco', 'Thalía Benavides', 'Wendy Chicaiza', 'Margot Revelo',
  'Nayeli Yánez', 'Daniela Flores', 'Gabriela Auqui', 'Melanie Baque', 'Merly Calle',
] as const;
export const SELLERS = NAMES.map(name => ({ id: name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replaceAll(' ', '-'), name, initials: name.split(' ').map(word => word[0]).join('') }));
export const sellerById = (id: string | null | undefined) => SELLERS.find(s => s.id === id) ?? null;
export const sellerName = (id: string | null | undefined): string => sellerById(id)?.name ?? 'Sin asignar';
