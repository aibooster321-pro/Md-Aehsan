import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTrackingId,
  calculateSLA,
  applySLAEngine,
  validatePIN,
  SLA_DAYS_THRESHOLD,
} from './sla.ts';
import type { Inquiry } from '../types/inquiry.ts';

test('generateTrackingId returns format GC-XXXXXX with 6 characters', () => {
  const id = generateTrackingId();
  assert.match(id, /^GC-[A-Z0-9]{6}$/);
});

test('calculateSLA reports correct remaining days under 7 days', () => {
  const now = Date.now();
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sampleInquiry: Inquiry = {
    id: 'GC-TEST01',
    studentName: 'Test Student',
    rollNumber: '123456',
    category: 'Classroom & Smartboard',
    description: 'Projector broken',
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
    status: 'open',
  };

  const sla = calculateSLA(sampleInquiry, now);
  assert.equal(sla.daysElapsed, 3);
  assert.equal(sla.daysRemaining, 4);
  assert.equal(sla.isOverdue, false);
  assert.equal(sla.slaStatusLabel, 'Auto-AKTU in 4d');
});

test('calculateSLA marks inquiry as overdue when elapsed days >= 7', () => {
  const now = Date.now();
  const eightDaysAgo = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString();
  const sampleInquiry: Inquiry = {
    id: 'GC-TEST02',
    studentName: 'Overdue Student',
    rollNumber: '123457',
    category: 'Hostel & Mess Food',
    description: 'Mess food quality issue',
    createdAt: eightDaysAgo,
    updatedAt: eightDaysAgo,
    status: 'open',
  };

  const sla = calculateSLA(sampleInquiry, now);
  assert.equal(sla.daysElapsed, 8);
  assert.equal(sla.isOverdue, true);
  assert.equal(sla.daysRemaining, 0);
});

test('calculateSLA stops countdown when status is resolved', () => {
  const now = Date.now();
  const sampleInquiry: Inquiry = {
    id: 'GC-TEST03',
    studentName: 'Resolved Student',
    rollNumber: '123458',
    category: 'Fan, AC & Electrical',
    description: 'Fan fixed',
    createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'resolved',
  };

  const sla = calculateSLA(sampleInquiry, now);
  assert.equal(sla.slaStatusLabel, 'Closed — SLA stopped');
  assert.equal(sla.isOverdue, false);
});

test('applySLAEngine automatically escalates unresolved inquiries older than 7 days', () => {
  const now = Date.now();
  const inquiries: Inquiry[] = [
    {
      id: 'GC-RECENT',
      studentName: 'Recent',
      rollNumber: '001',
      category: 'Classroom',
      description: 'Issue',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
    },
    {
      id: 'GC-EXPIRED',
      studentName: 'Expired',
      rollNumber: '002',
      category: 'Sanitation',
      description: 'Water leak',
      createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
    },
  ];

  const result = applySLAEngine(inquiries, now);
  assert.equal(result.escalatedCount, 1);
  assert.equal(result.updatedInquiries[0].status, 'open');
  assert.equal(result.updatedInquiries[1].status, 'escalated_aktu');
  assert.ok(result.updatedInquiries[1].escalatedAt);
});

test('validatePIN correctly compares PINs', () => {
  assert.equal(validatePIN('7890', '7890'), true);
  assert.equal(validatePIN(' 7890 ', '7890'), true);
  assert.equal(validatePIN('1234', '7890'), false);
  assert.equal(validatePIN('', '7890'), false);
});
