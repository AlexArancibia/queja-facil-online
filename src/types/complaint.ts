
export interface Complaint {
  id: string;
  fullName: string;
  email: string;
  store: string;
  observationType: string;
  detail: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En proceso' | 'Resuelta' | 'Rechazada';
  attachments?: File[];
  attachmentUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolution?: string;
  managerComments?: string;
  resolutionAttachments?: string[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  managerId?: string;
}

export const OBSERVATION_TYPES = [
  'Limpieza',
  'Atención',
  'Producto',
  'Infraestructura',
  'Seguridad',
  'Precio',
  'Otro'
];

export const MOCK_STORES: Store[] = [
  { id: 'tienda-centro', name: 'Tienda Centro', address: 'Av. Principal 123' },
  { id: 'tienda-norte', name: 'Tienda Norte', address: 'Calle Norte 456' },
  { id: 'tienda-sur', name: 'Tienda Sur', address: 'Av. Sur 789' },
  { id: 'tienda-oeste', name: 'Tienda Oeste', address: 'Calle Oeste 321' }
];
