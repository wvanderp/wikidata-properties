import {expect} from 'chai';
import properties from '../'

describe('getProperties', () => {
    it('should return a property', () => {
        const property = properties.getProperty('P6');

        expect(property?.id).to.be.equal('P6');
        expect(property?.datatype).to.be.equal('wikibase-item');
    })
})