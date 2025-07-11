
export interface Instructor {
  id: string;
  name: string;
  discipline: 'siclo' | 'barre' | 'yoga' | 'ejercito';
  storeId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Rating {
  id: string;
  instructorId: string;
  storeId: string;
  discipline: string;
  instructorName: string;
  date: string;
  schedule: string;
  
  // NPS Score (1-10)
  npsScore: number;
  
  // Observaciones (1-10)
  instructorRating: number;
  cleanlinessRating: number;
  audioRating: number;
  attentionQualityRating: number;
  amenitiesRating: number;
  punctualityRating: number;
  
  // Optional comments
  comments?: string;
  
  createdAt: Date;
}

export const DISCIPLINES = [
  'siclo',
  'barre', 
  'yoga',
  'ejercito'
] as const;

export const MOCK_INSTRUCTORS: Instructor[] = [
  // Siclo instructors
  {
    id: 'instructor-1',
    name: 'María González',
    discipline: 'siclo',
    storeId: 'tienda-centro',
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: 'instructor-2',
    name: 'Carlos Ruiz',
    discipline: 'siclo',
    storeId: 'tienda-norte',
    createdAt: new Date('2024-01-20'),
    isActive: true
  },
  {
    id: 'instructor-3',
    name: 'Sofía Herrera',
    discipline: 'siclo',
    storeId: 'tienda-sur',
    createdAt: new Date('2024-02-01'),
    isActive: true
  },
  {
    id: 'instructor-4',
    name: 'Diego Morales',
    discipline: 'siclo',
    storeId: 'tienda-oeste',
    createdAt: new Date('2024-02-10'),
    isActive: true
  },
  
  // Barre instructors
  {
    id: 'instructor-5',
    name: 'Ana Martínez',
    discipline: 'barre',
    storeId: 'tienda-centro',
    createdAt: new Date('2024-01-25'),
    isActive: true
  },
  {
    id: 'instructor-6',
    name: 'Luis Fernández',
    discipline: 'barre',
    storeId: 'tienda-norte',
    createdAt: new Date('2024-02-05'),
    isActive: true
  },
  {
    id: 'instructor-7',
    name: 'Carmen López',
    discipline: 'barre',
    storeId: 'tienda-sur',
    createdAt: new Date('2024-02-15'),
    isActive: true
  },
  
  // Yoga instructors
  {
    id: 'instructor-8',
    name: 'Patricia Vega',
    discipline: 'yoga',
    storeId: 'tienda-centro',
    createdAt: new Date('2024-01-30'),
    isActive: true
  },
  {
    id: 'instructor-9',
    name: 'Roberto Sánchez',
    discipline: 'yoga',
    storeId: 'tienda-norte',
    createdAt: new Date('2024-02-08'),
    isActive: true
  },
  {
    id: 'instructor-10',
    name: 'Valentina Torres',
    discipline: 'yoga',
    storeId: 'tienda-oeste',
    createdAt: new Date('2024-02-12'),
    isActive: true
  },
  
  // Ejercito instructors
  {
    id: 'instructor-11',
    name: 'Alejandro Castro',
    discipline: 'ejercito',
    storeId: 'tienda-centro',
    createdAt: new Date('2024-01-18'),
    isActive: true
  },
  {
    id: 'instructor-12',
    name: 'Gabriela Ramírez',
    discipline: 'ejercito',
    storeId: 'tienda-sur',
    createdAt: new Date('2024-02-03'),
    isActive: true
  },
  {
    id: 'instructor-13',
    name: 'Fernando Silva',
    discipline: 'ejercito',
    storeId: 'tienda-oeste',
    createdAt: new Date('2024-02-18'),
    isActive: true
  }
];
