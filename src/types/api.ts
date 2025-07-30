// Enums from the backend schema
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  USER = 'USER'
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum ComplaintPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum Discipline {
  SICLO = 'SICLO',
  BARRE = 'BARRE',
  EJERCITO = 'EJERCITO',
  YOGA = 'YOGA'
}

// Attachment interface
export interface Attachment {
  filename: string;
  url: string;
}

// API DTOs
export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string;
  emailVerified?: Date;
  image?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  authProvider: AuthProvider;
  lastLogin?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  isActive: boolean;
  branches:Branch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  discipline: Discipline;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Complaint {
  id: string;
  fullName: string;
  email: string;
  branchId: string;
  observationType: string;
  detail: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolution?: string;
  managerComments?: string;
  attachments: Attachment[];
  resolutionAttachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  branch?: Branch;
}

export interface Rating {
  id: string;
  instructorId: string;
  branchId: string;
  instructorName: string;
  discipline: Discipline;
  schedule: string;
  date: string;
  instructorRating: number;
  cleanlinessRating: number;
  audioRating: number;
  attentionQualityRating: number;
  amenitiesRating: number;
  punctualityRating: number;
  npsScore: number;
  comments?: string;
  fullName?: string;
  email?: string;
  createdAt: Date;
  instructor?: Instructor;
  branch?: Branch;
}

// DTOs for API requests
export interface CreateComplaintDto {
  fullName: string;
  email: string;
  branchId: string;
  observationType: string;
  detail: string;
  priority: ComplaintPriority;
  attachments?: Attachment[];
}

export interface UpdateComplaintDto {
  fullName?: string;
  email?: string;
  branchId?: string;
  observationType?: string;
  detail?: string;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  resolution?: string;
  managerComments?: string;
  attachments?: Attachment[];
  resolutionAttachments?: Attachment[];
}

export interface CreateRatingDto {
  fullName?: string;
  email?: string;
  instructorId: string;
  branchId: string;
  instructorName: string;
  discipline: Discipline;
  schedule: string;
  date: string;
  instructorRating: number;
  cleanlinessRating: number;
  audioRating: number;
  attentionQualityRating: number;
  amenitiesRating: number;
  punctualityRating: number;
  npsScore: number;
  comments?: string;
}

export interface UpdateRatingDto {
  instructorId?: string;
  branchId?: string;
  instructorName?: string;
  discipline?: Discipline;
  schedule?: string;
  date?: string;
  instructorRating?: number;
  cleanlinessRating?: number;
  audioRating?: number;
  attentionQualityRating?: number;
  amenitiesRating?: number;
  punctualityRating?: number;
  npsScore?: number;
  comments?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  authProvider?: AuthProvider;
  branchId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  authProvider?: AuthProvider;
  branchId?: string;
  newPassword?: string;
}

export interface CreateBranchDto {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface CreateInstructorDto {
  name: string;
  email?: string;
  phone?: string;
  discipline: Discipline;
  isActive?: boolean;
}

export interface UpdateInstructorDto {
  name?: string;
  email?: string;
  phone?: string;
  discipline?: Discipline;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: UserRole;
  authProvider?: AuthProvider;
  branchId?: string;
}

// API Response interfaces
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ComplaintStats {
  total: number;
  byStatus: {
    pending: number;
    inProcess: number;
    resolved: number;
    rejected: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  resolutionRate: number;
}

export interface RatingStats {
  totalRatings: number;
  averages: {
    instructor: number;
    cleanliness: number;
    audio: number;
    attentionQuality: number;
    amenities: number;
    punctuality: number;
    nps: number;
    overall: number;
  };
}

// Email DTOs
export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  from?: {
    name?: string;
    address?: string;
  };
  metadata?: {
    branchId?: string;
    branchName?: string;
    managers?: Array<{
      id: string;
      name: string;
      email: string;
    }>;
    type?: 'complaint' | 'rating' | 'status_update';
    entityId?: string;
  };
}

export interface FormSubmissionDto {
  html?: string;
  [key: string]: string | undefined; // permite cualquier otro campo además de html
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}