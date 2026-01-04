import { expect } from 'chai';
import { chunk, fromPairs } from '../utils/utils/arrayUtils';

describe('arrayUtils', () => {
    describe('chunk', () => {
        it('should split an array into chunks of the specified size', () => {
            const result = chunk([1, 2, 3, 4, 5], 2);
            expect(result).to.deep.equal([[1, 2], [3, 4], [5]]);
        });

        it('should handle arrays that divide evenly', () => {
            const result = chunk([1, 2, 3, 4], 2);
            expect(result).to.deep.equal([[1, 2], [3, 4]]);
        });

        it('should handle chunk size of 1', () => {
            const result = chunk([1, 2, 3], 1);
            expect(result).to.deep.equal([[1], [2], [3]]);
        });

        it('should handle chunk size larger than array length', () => {
            const result = chunk([1, 2, 3], 10);
            expect(result).to.deep.equal([[1, 2, 3]]);
        });

        it('should handle empty arrays', () => {
            const result = chunk([], 2);
            expect(result).to.deep.equal([]);
        });

        it('should work with strings', () => {
            const result = chunk(['a', 'b', 'c', 'd', 'e'], 2);
            expect(result).to.deep.equal([['a', 'b'], ['c', 'd'], ['e']]);
        });

        it('should work with objects', () => {
            const obj1 = { id: 1 };
            const obj2 = { id: 2 };
            const obj3 = { id: 3 };
            const result = chunk([obj1, obj2, obj3], 2);
            expect(result).to.deep.equal([[obj1, obj2], [obj3]]);
        });

        it('should throw an error if first argument is not an array', () => {
            expect(() => chunk(null as any, 2)).to.throw(TypeError, 'First argument must be an array');
            expect(() => chunk(undefined as any, 2)).to.throw(TypeError, 'First argument must be an array');
            expect(() => chunk('not an array' as any, 2)).to.throw(TypeError, 'First argument must be an array');
        });

        it('should throw an error if size is not a positive integer', () => {
            expect(() => chunk([1, 2, 3], 0)).to.throw(RangeError, 'Size must be a positive integer');
            expect(() => chunk([1, 2, 3], -1)).to.throw(RangeError, 'Size must be a positive integer');
            expect(() => chunk([1, 2, 3], 1.5)).to.throw(RangeError, 'Size must be a positive integer');
            expect(() => chunk([1, 2, 3], NaN)).to.throw(RangeError, 'Size must be a positive integer');
        });
    });

    describe('fromPairs', () => {
        it('should create an object from key-value pairs', () => {
            const result = fromPairs([['a', 1], ['b', 2]]);
            expect(result).to.deep.equal({ a: 1, b: 2 });
        });

        it('should handle empty array', () => {
            const result = fromPairs([]);
            expect(result).to.deep.equal({});
        });

        it('should handle numeric keys', () => {
            const result = fromPairs([[1, 'one'], [2, 'two']]);
            expect(result).to.deep.equal({ 1: 'one', 2: 'two' });
        });

        it('should handle symbol keys', () => {
            const sym = Symbol('test');
            const result = fromPairs([[sym, 'value']]);
            expect(result[sym]).to.equal('value');
        });

        it('should handle object values', () => {
            const value1 = { id: 1 };
            const value2 = { id: 2 };
            const result = fromPairs([['first', value1], ['second', value2]]);
            expect(result).to.deep.equal({ first: value1, second: value2 });
        });

        it('should overwrite duplicate keys with the last value', () => {
            const result = fromPairs([['a', 1], ['b', 2], ['a', 3]]);
            expect(result).to.deep.equal({ a: 3, b: 2 });
        });

        it('should skip invalid pairs (not arrays or arrays with less than 2 elements)', () => {
            const result = fromPairs([
                ['valid', 1],
                null as any,
                ['another', 2],
                [] as any,
                ['single'] as any,
                ['third', 3]
            ]);
            expect(result).to.deep.equal({ valid: 1, another: 2, third: 3 });
        });

        it('should handle array values', () => {
            const result = fromPairs([['a', [1, 2, 3]], ['b', [4, 5, 6]]]);
            expect(result).to.deep.equal({ a: [1, 2, 3], b: [4, 5, 6] });
        });

        it('should handle null and undefined values', () => {
            const result = fromPairs([['a', null], ['b', undefined], ['c', 'value']]);
            expect(result).to.deep.equal({ a: null, b: undefined, c: 'value' });
        });

        it('should throw an error if argument is not an array', () => {
            expect(() => fromPairs(null as any)).to.throw(TypeError, 'Argument must be an array');
            expect(() => fromPairs(undefined as any)).to.throw(TypeError, 'Argument must be an array');
            expect(() => fromPairs('not an array' as any)).to.throw(TypeError, 'Argument must be an array');
        });

        it('should handle more than 2 elements in a pair (ignore extra elements)', () => {
            const result = fromPairs([['a', 1, 'extra'], ['b', 2, 'extra', 'more']] as any);
            expect(result).to.deep.equal({ a: 1, b: 2 });
        });
    });
});
