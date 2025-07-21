// Enums from the backend schema
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
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
  branchId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: Branch;
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
  branchId: string;
  isActive?: boolean;
}

export interface UpdateInstructorDto {
  name?: string;
  email?: string;
  phone?: string;
  discipline?: Discipline;
  branchId?: string;
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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byBranch: Record<string, number>;
}

export interface RatingStats {
  total: number;
  averageRating: number;
  averageNPS: number;
  ratingsByInstructor: Record<string, number>;
  ratingsByBranch: Record<string, number>;
  disciplineStats: Record<string, {
    count: number;
    averageRating: number;
    averageNPS: number;
  }>;
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