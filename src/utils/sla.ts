import type { Inquiry, SLAInfo } from '../types/inquiry.ts';

export const SLA_DAYS_THRESHOLD = 7;

/**
 * Generate a unique tracking ID in the format "GC-XXXXXX"
 * where X is an uppercase alphanumeric character (A-Z, 0-9)
 */
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GC-${code}`;
}

/**
 * Calculate SLA metrics for an inquiry
 */
export function calculateSLA(inquiry: Inquiry, nowMs = Date.now()): SLAInfo {
  const createdMs = new Date(inquiry.createdAt).getTime();
  const simulatedOffsetMs = (inquiry.simulatedDaysElapsed || 0) * 24 * 60 * 60 * 1000;
  const effectiveAgeMs = Math.max(0, nowMs - createdMs + simulatedOffsetMs);
  const daysElapsed = Math.floor(effectiveAgeMs / (24 * 60 * 60 * 1000));

  if (inquiry.status === 'resolved') {
    return {
      daysElapsed,
      daysRemaining: 0,
      isOverdue: false,
      slaStatusLabel: 'Closed — SLA stopped',
    };
  }

  if (inquiry.status === 'escalated_aktu') {
    return {
      daysElapsed,
      daysRemaining: 0,
      isOverdue: true,
      slaStatusLabel: 'Transferred to AKTU',
    };
  }

  const daysRemaining = Math.max(0, SLA_DAYS_THRESHOLD - daysElapsed);
  const isOverdue = daysElapsed >= SLA_DAYS_THRESHOLD;

  let slaStatusLabel = '';
  if (isOverdue) {
    slaStatusLabel = 'Overdue — Escalating to AKTU';
  } else if (daysRemaining <= 1) {
    slaStatusLabel = 'Auto-AKTU in 1d';
  } else {
    slaStatusLabel = `Auto-AKTU in ${daysRemaining}d`;
  }

  return {
    daysElapsed,
    daysRemaining,
    isOverdue,
    slaStatusLabel,
  };
}

/**
 * Evaluates all inquiries against the 7-day SLA rule and automatically escalates
 * any unresolved inquiry older than 7 days to AKTU.
 */
export function applySLAEngine(inquiries: Inquiry[], nowMs = Date.now()): {
  updatedInquiries: Inquiry[];
  escalatedCount: number;
} {
  let escalatedCount = 0;

  const updatedInquiries = inquiries.map((inquiry) => {
    // If already closed or escalated, keep as is
    if (inquiry.status === 'resolved' || inquiry.status === 'escalated_aktu') {
      return inquiry;
    }

    const sla = calculateSLA(inquiry, nowMs);
    if (sla.isOverdue) {
      escalatedCount++;
      return {
        ...inquiry,
        status: 'escalated_aktu' as const,
        escalatedAt: inquiry.escalatedAt || new Date(nowMs).toISOString(),
        aktuNotes: inquiry.aktuNotes || 'Auto-escalated to AKTU State Escalation Desk after exceeding 7-day college SLA.',
        updatedAt: new Date(nowMs).toISOString(),
      };
    }

    return inquiry;
  });

  return { updatedInquiries, escalatedCount };
}

/**
 * Validate Admin or AKTU Security PIN
 */
export function validatePIN(enteredPIN: string, targetPIN: string): boolean {
  if (!enteredPIN || !targetPIN) return false;
  return enteredPIN.trim() === targetPIN.trim();
}

/**
 * Format timestamp nicely
 */
export function formatDisplayDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
