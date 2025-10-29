// P2-1: Basic test for sanitize utility
import { sanitizeInput } from '../src/utils/sanitize';

// Mocking vitest/jest environment
const describe = (name: string, fn: () => void) => fn();
const test = (name: string, fn: () => void) => fn();
const expect = (value: any) => ({
  toBe: (expected: any) => {
    if (value !== expected) throw new Error(`Expected ${value} to be ${expected}`);
  }
});

describe('sanitizeInput', () => {
  test('should return empty string for null or undefined input', () => {
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });

  test('should not change a clean string', () => {
    const input = 'Hello world 123';
    expect(sanitizeInput(input)).toBe(input);
  });

  test('should escape < and > characters', () => {
    const input = '<script>alert("xss")</script>';
    const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('should escape &, ", \', and / characters', () => {
    const input = 'AT&T\'s "best" /price/';
    const expected = 'AT&amp;T&#x27;s &quot;best&quot; &#x2F;price&#x2F;';
    expect(sanitizeInput(input)).toBe(expected);
  });
});