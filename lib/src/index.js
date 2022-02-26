"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var properties_json_1 = __importDefault(require("../data/properties.json"));
var datatypeTypes_json_1 = __importDefault(require("../data/datatypeTypes.json"));
var MonolingualLanguages_json_1 = __importDefault(require("../data/MonolingualLanguages.json"));
var LabelLanguages_json_1 = __importDefault(require("../data/LabelLanguages.json"));
var SiteDetails_json_1 = __importDefault(require("../data/SiteDetails.json"));
var properties = properties_json_1["default"];
var getProperty = function (propertyID) { var _a; return (_a = properties.find(function (r) { return r.id === propertyID; })) !== null && _a !== void 0 ? _a : null; };
var datatypeTypes = datatypeTypes_json_1["default"];
var monolingualLanguages = MonolingualLanguages_json_1["default"];
var labelLanguages = LabelLanguages_json_1["default"];
var siteDetails = SiteDetails_json_1["default"];
exports["default"] = {
    properties: properties,
    getProperty: getProperty,
    datatypeTypes: datatypeTypes,
    monolingualLanguages: monolingualLanguages,
    labelLanguages: labelLanguages,
    siteDetails: siteDetails
};
//# sourceMappingURL=index.js.map