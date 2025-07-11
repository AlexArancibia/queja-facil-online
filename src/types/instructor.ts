
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
    discipline: 'barre',
    storeId: 'tienda-norte',
    createdAt: new Date('2024-01-20'),
    isActive: true
  },
  {
    id: 'instructor-3',
    name: 'Ana Martínez',
    discipline: 'yoga',
    storeId: 'tienda-sur',
    createdAt: new Date('2024-02-01'),
    isActive: true
  },
  {
    id: 'instructor-4',
    name: 'Luis Fernández',
    discipline: 'ejercito',
    storeId: 'tienda-oeste',
    createdAt: new Date('2024-02-10'),
    isActive: true
  }
];
