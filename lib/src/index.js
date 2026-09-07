"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const properties_json_1 = __importDefault(require("../data/properties.json"));
const datatypeTypes_json_1 = __importDefault(require("../data/datatypeTypes.json"));
const MonolingualLanguages_json_1 = __importDefault(require("../data/MonolingualLanguages.json"));
const LabelLanguages_json_1 = __importDefault(require("../data/LabelLanguages.json"));
const SiteDetails_json_1 = __importDefault(require("../data/SiteDetails.json"));
const properties = properties_json_1.default;
const getProperty = (propertyID) => properties.find((r) => r.id === propertyID) ?? null;
const datatypeTypes = datatypeTypes_json_1.default;
const monolingualLanguages = MonolingualLanguages_json_1.default;
const labelLanguages = LabelLanguages_json_1.default;
const siteDetails = SiteDetails_json_1.default;
exports.default = {
    properties,
    getProperty,
    datatypeTypes,
    monolingualLanguages,
    labelLanguages,
    siteDetails
};
//# sourceMappingURL=index.js.map