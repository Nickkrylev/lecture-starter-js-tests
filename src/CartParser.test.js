import CartParser from './CartParser';
import { readFileSync } from 'fs';
import path from 'path';

let parser;

beforeEach(() => {
  parser = new CartParser();
});

describe('CartParser - unit tests', () => {
  test('should have parse method', () => {
    expect(typeof parser.parse).toBe('function');
  });

  test('should correctly parse a valid line into an item', () => {
    const line = 'Apple,2.5,4';
    const item = parser.parseLine(line);
    expect(item).toHaveProperty('name', 'Apple');
    expect(item).toHaveProperty('price', 2.5);
    expect(item).toHaveProperty('quantity', 4);
    expect(item).toHaveProperty('id');
  });

  test('should calculate correct total for given items', () => {
    const items = [
      { price: 1.5, quantity: 2 },
      { price: 3.0, quantity: 1 },
    ];
    const total = parser.calcTotal(items);
    expect(total).toBe(6.0);
  });

  test('should return no errors for valid content', () => {
    const content = 'Product name,Price,Quantity\nApple,2.5,2';
    const errors = parser.validate(content);
    expect(errors).toEqual([]);
  });

  test('should return error for missing headers', () => {
    const content = 'Product,Cost,Qty\nApple,2.5,2';
    const errors = parser.validate(content);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should return error for negative quantity', () => {
    const content = 'Product name,Price,Quantity\nBanana,1.0,-3';
    const errors = parser.validate(content);
    expect(errors.some(e => e.message.includes('positive number'))).toBeTruthy();
  });

  test('should return error for empty product name', () => {
    const content = 'Product name,Price,Quantity\n,2.0,1';
    const errors = parser.validate(content);
    expect(errors.some(e => e.message.includes('nonempty string'))).toBeTruthy();
  });

  test('should return error for non-numeric price', () => {
    const content = 'Product name,Price,Quantity\nOrange,free,2';
    const errors = parser.validate(content);
    expect(errors.some(e => e.message.includes('positive number'))).toBeTruthy();
  });

  test('should return error for incomplete row', () => {
    const content = 'Product name,Price,Quantity\nOrange,2.5';
    const errors = parser.validate(content);
    expect(errors.some(e => e.type === 'row')).toBeTruthy();
  });

  test('should ignore empty lines during validation', () => {
    const content = 'Product name,Price,Quantity\n\nOrange,2.5,1\n\n';
    const errors = parser.validate(content);
    expect(errors.length).toBe(0);
  });

  test('calcTotal should return 0 for empty cart', () => {
    const total = parser.calcTotal([]);
    expect(total).toBe(0);
  });
});

describe('CartParser - integration test', () => {
  test('should correctly parse cart.csv and calculate total', () => {
    const filePath = path.resolve(__dirname, '../samples/cart.csv');
    const result = parser.parse(filePath);

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result).toHaveProperty('total');
    expect(typeof result.total).toBe('number');
  });
});
