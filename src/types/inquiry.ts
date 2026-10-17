export type InquiryCategory =
  | 'anti-ragging'
  | 'classroom'
  | 'electrical'
  | 'furniture'
  | 'sports'
  | 'hostel'
  | 'exams'
  | 'fees'
  | 'transport'
  | 'sanitation';

export type InquiryStatus = 'open' | 'in_progress' | 'resolved' | 'escalated_aktu';

export interface Inquiry {
  id: string; // e.g. "GC-FKCCNN"
  studentName: string;
  rollNumber: string;
  collegeId?: string; // e.g. "GNIOT-2023-CS-042"
  classroomNumber?: string; // e.g. "Room 302"
  semester?: string; // e.g. "5th Semester"
  section?: string; // e.g. "Section A"
  category: string;
  description: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: InquiryStatus;
  adminNotes?: string;
  aktuNotes?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  priority?: 'normal' | 'high' | 'urgent';
  simulatedDaysElapsed?: number; // to allow SLA testing and time simulation
}

export interface SLAInfo {
  daysElapsed: number;
  daysRemaining: number;
  isOverdue: boolean;
  slaStatusLabel: string;
}

export interface CategoryInfo {
  id: InquiryCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
}
