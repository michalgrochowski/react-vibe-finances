import { describe, it, expect } from 'vitest';
import {
  centsToPlnString,
  centsToPlnNumber,
  plnToCents,
  formatPlnCurrency,
  parseAmountToCents,
  calculatePercentage,
  formatPercentage,
} from '../money';

describe('money utilities', () => {
  describe('centsToPlnString', () => {
    it('should convert cents to PLN string', () => {
      expect(centsToPlnString(10000)).toBe('100.00 PLN');
      expect(centsToPlnString(12345)).toBe('123.45 PLN');
      expect(centsToPlnString(100)).toBe('1.00 PLN');
      expect(centsToPlnString(0)).toBe('0.00 PLN');
    });

    it('should handle negative values', () => {
      expect(centsToPlnString(-10000)).toBe('-100.00 PLN');
    });

    it('should handle decimal precision', () => {
      expect(centsToPlnString(12399)).toBe('123.99 PLN');
      expect(centsToPlnString(12301)).toBe('123.01 PLN');
    });
  });

  describe('centsToPlnNumber', () => {
    it('should convert cents to PLN number', () => {
      expect(centsToPlnNumber(10000)).toBe(100);
      expect(centsToPlnNumber(12345)).toBe(123.45);
      expect(centsToPlnNumber(100)).toBe(1);
      expect(centsToPlnNumber(0)).toBe(0);
    });
  });

  describe('plnToCents', () => {
    it('should convert PLN to cents', () => {
      expect(plnToCents(100)).toBe(10000);
      expect(plnToCents(123.45)).toBe(12345);
      expect(plnToCents(1)).toBe(100);
      expect(plnToCents(0)).toBe(0);
    });

    it('should round to nearest cent', () => {
      expect(plnToCents(123.456)).toBe(12346);
      expect(plnToCents(123.454)).toBe(12345);
    });

    it('should handle negative values', () => {
      expect(plnToCents(-100)).toBe(-10000);
    });
  });

  describe('formatPlnCurrency', () => {
    it('should format number to PLN currency string', () => {
      expect(formatPlnCurrency(100)).toMatch(/100[,.]00.*zł/);
      expect(formatPlnCurrency(1234.56)).toMatch(/1.*234[,.]56.*zł/);
      expect(formatPlnCurrency(0)).toMatch(/0[,.]00.*zł/);
    });

    it('should handle negative values', () => {
      expect(formatPlnCurrency(-100)).toMatch(/-100[,.]00.*zł/);
    });

    it('should maintain decimal precision', () => {
      expect(formatPlnCurrency(123.99)).toMatch(/123[,.]99.*zł/);
      expect(formatPlnCurrency(123.01)).toMatch(/123[,.]01.*zł/);
    });
  });

  describe('parseAmountToCents', () => {
    it('should parse string amount to cents', () => {
      expect(parseAmountToCents('100')).toBe(10000);
      expect(parseAmountToCents('123.45')).toBe(12345);
      expect(parseAmountToCents('123,45')).toBe(12345);
      expect(parseAmountToCents('0')).toBe(0);
    });

    it('should handle invalid input', () => {
      expect(parseAmountToCents('abc')).toBe(null);
      expect(parseAmountToCents('')).toBe(null);
      expect(parseAmountToCents('   ')).toBe(null);
    });

    it('should reject negative values', () => {
      expect(parseAmountToCents('-100')).toBe(null);
    });

    it('should handle decimal precision', () => {
      expect(parseAmountToCents('123.456')).toBe(12346);
      expect(parseAmountToCents('123.454')).toBe(12345);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 4)).toBe(25);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should handle zero part', () => {
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it('should handle decimals', () => {
      expect(calculatePercentage(33.33, 100)).toBeCloseTo(33.33, 2);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default precision', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(33.33333)).toBe('33.3%');
    });

    it('should format percentage with custom precision', () => {
      expect(formatPercentage(50, 0)).toBe('50%');
      expect(formatPercentage(33.33333, 2)).toBe('33.33%');
      expect(formatPercentage(33.33333, 3)).toBe('33.333%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });
});

