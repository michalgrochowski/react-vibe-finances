import { describe, it, expect } from 'vitest';
import {
  formatToMonthString,
  parseMonthString,
  getCurrentMonthString,
  getPreviousMonthString,
  getNextMonthString,
  formatMonthDisplay,
  formatMonthDisplayShort,
  getMonthName,
  getMonthNameShort,
  getYearFromMonthString,
  getMonthNumber,
  isMonthBefore,
  isMonthAfter,
  getMonthStart,
  getMonthEnd,
  getMonthsForYear,
  formatDateDisplay,
  formatDateDisplayShort,
} from '../date';

describe('date utilities', () => {
  describe('formatToMonthString', () => {
    it('should format date to YYYY-MM', () => {
      expect(formatToMonthString(new Date('2024-10-15'))).toBe('2024-10');
      expect(formatToMonthString(new Date('2024-01-01'))).toBe('2024-01');
      expect(formatToMonthString(new Date('2024-12-31'))).toBe('2024-12');
    });
  });

  describe('parseMonthString', () => {
    it('should parse YYYY-MM to date', () => {
      const date = parseMonthString('2024-10');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(9); // 0-indexed
    });
  });

  describe('getPreviousMonthString', () => {
    it('should get previous month', () => {
      expect(getPreviousMonthString('2024-10')).toBe('2024-09');
      expect(getPreviousMonthString('2024-02')).toBe('2024-01');
    });

    it('should handle year boundary', () => {
      expect(getPreviousMonthString('2024-01')).toBe('2023-12');
    });
  });

  describe('getNextMonthString', () => {
    it('should get next month', () => {
      expect(getNextMonthString('2024-10')).toBe('2024-11');
      expect(getNextMonthString('2024-11')).toBe('2024-12');
    });

    it('should handle year boundary', () => {
      expect(getNextMonthString('2024-12')).toBe('2025-01');
    });
  });

  describe('formatMonthDisplay', () => {
    it('should format month for display', () => {
      expect(formatMonthDisplay('2024-10')).toBe('October 2024');
      expect(formatMonthDisplay('2024-01')).toBe('January 2024');
      expect(formatMonthDisplay('2024-12')).toBe('December 2024');
    });
  });

  describe('formatMonthDisplayShort', () => {
    it('should format month for short display', () => {
      expect(formatMonthDisplayShort('2024-10')).toBe('Oct 2024');
      expect(formatMonthDisplayShort('2024-01')).toBe('Jan 2024');
    });
  });

  describe('getMonthName', () => {
    it('should get month name', () => {
      expect(getMonthName('2024-10')).toBe('October');
      expect(getMonthName('2024-01')).toBe('January');
      expect(getMonthName('2024-12')).toBe('December');
    });
  });

  describe('getMonthNameShort', () => {
    it('should get short month name', () => {
      expect(getMonthNameShort('2024-10')).toBe('Oct');
      expect(getMonthNameShort('2024-01')).toBe('Jan');
    });
  });

  describe('getYearFromMonthString', () => {
    it('should extract year from month string', () => {
      expect(getYearFromMonthString('2024-10')).toBe(2024);
      expect(getYearFromMonthString('2025-01')).toBe(2025);
    });
  });

  describe('getMonthNumber', () => {
    it('should get month number (1-12)', () => {
      expect(getMonthNumber('2024-01')).toBe(1);
      expect(getMonthNumber('2024-10')).toBe(10);
      expect(getMonthNumber('2024-12')).toBe(12);
    });
  });

  describe('isMonthBefore', () => {
    it('should correctly compare months', () => {
      expect(isMonthBefore('2024-09', '2024-10')).toBe(true);
      expect(isMonthBefore('2024-10', '2024-09')).toBe(false);
      expect(isMonthBefore('2023-12', '2024-01')).toBe(true);
    });
  });

  describe('isMonthAfter', () => {
    it('should correctly compare months', () => {
      expect(isMonthAfter('2024-10', '2024-09')).toBe(true);
      expect(isMonthAfter('2024-09', '2024-10')).toBe(false);
      expect(isMonthAfter('2024-01', '2023-12')).toBe(true);
    });
  });

  describe('getMonthStart', () => {
    it('should get start of month', () => {
      const start = getMonthStart('2024-10');
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
    });
  });

  describe('getMonthEnd', () => {
    it('should get end of month', () => {
      const end = getMonthEnd('2024-10');
      expect(end.getDate()).toBe(31);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });

    it('should handle different month lengths', () => {
      expect(getMonthEnd('2024-02').getDate()).toBe(29); // leap year
      expect(getMonthEnd('2023-02').getDate()).toBe(28); // non-leap year
      expect(getMonthEnd('2024-04').getDate()).toBe(30); // 30-day month
    });
  });

  describe('getMonthsForYear', () => {
    it('should generate all months for a year', () => {
      const months = getMonthsForYear(2024);
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('2024-01');
      expect(months[11]).toBe('2024-12');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date for display', () => {
      expect(formatDateDisplay(new Date('2024-10-15'))).toBe('Oct 15, 2024');
      expect(formatDateDisplay(new Date('2024-01-01'))).toBe('Jan 1, 2024');
    });
  });

  describe('formatDateDisplayShort', () => {
    it('should format date for short display', () => {
      expect(formatDateDisplayShort(new Date('2024-10-15'))).toBe('15/10/2024');
      expect(formatDateDisplayShort(new Date('2024-01-01'))).toBe('01/01/2024');
    });
  });
});

