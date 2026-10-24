import { describe, expect, it } from 'vitest';
import { canChangeType, canDelete, canEdit, canFinish, canStart } from './exam-status.js';

describe('exam-status rules', () => {
  it('canEdit should only allow DRAFT and ONGOING', () => {
    expect(canEdit('DRAFT')).toBe(true);
    expect(canEdit('ONGOING')).toBe(true);
    expect(canEdit('FINISHED')).toBe(false);
  });

  it('canDelete should only allow DRAFT', () => {
    expect(canDelete('DRAFT')).toBe(true);
    expect(canDelete('ONGOING')).toBe(false);
    expect(canDelete('FINISHED')).toBe(false);
  });

  it('canStart should only allow DRAFT', () => {
    expect(canStart('DRAFT')).toBe(true);
    expect(canStart('ONGOING')).toBe(false);
    expect(canStart('FINISHED')).toBe(false);
  });

  it('canChangeType should only allow DRAFT with 0 participants', () => {
    expect(canChangeType('DRAFT', 0)).toBe(true);
    expect(canChangeType('DRAFT', 1)).toBe(false);
    expect(canChangeType('ONGOING', 0)).toBe(false);
    expect(canChangeType('FINISHED', 0)).toBe(false);
  });

  it('canFinish should only allow ONGOING', () => {
    expect(canFinish('DRAFT')).toBe(false);
    expect(canFinish('ONGOING')).toBe(true);
    expect(canFinish('FINISHED')).toBe(false);
  });
});
