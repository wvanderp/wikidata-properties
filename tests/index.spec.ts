import {expect, test} from 'vitest';
import properties from '../src/index';

test('should return a property', () => {
    const property = properties.getProperty('P6');

    expect(property?.id).to.be.equal('P6');
    expect(property?.datatype).to.be.equal('wikibase-item');
})