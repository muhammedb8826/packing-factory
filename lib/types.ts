// Packaging Factory – shared types

export type NotificationType = "email" | "sms" | "push";
export type DashboardView = "simple" | "progress" | "financial";
export type ReportingFrequency = "daily" | "weekly" | "monthly";
export type AccessLevel = "viewer" | "member" | "full";

export interface UserPreferences {
  id: number;
  clientId: number;
  notificationType: NotificationType;
  dashboardView: DashboardView;
  reportingFrequency: ReportingFrequency;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export type JobOrderStatus =
  | "submitted"
  | "approved"
  | "hr_pending"
  | "inventory_pending"
  | "in_production"
  | "qc_pending"
  | "qc_done"
  | "ready_dispatch"
  | "dispatched"
  | "financial_completed";

export interface JobSpecifications {
  productType: "carton" | "plastic" | "flexible" | "other";
  quantity: number;
  dimensions?: string;
  material?: string;
  finish?: string;
  notes?: string;
}

export interface JobOrder {
  id: number;
  jobId: string;
  clientId: number;
  status: JobOrderStatus;
  specifications: JobSpecifications;
  createdAt: string;
  approvedAt: string | null;
  assignedToProduction: string | null;
  assignedToHR: string | null;
  hrReady: boolean;
  inventoryReady: boolean;
  productionStarted: string | null;
  qcStatus: string | null;
  dispatchReady: string | null;
  financialCompleted: string | null;
}

export interface CreateJobOrderInput {
  clientId: number;
  specifications: JobSpecifications;
}
