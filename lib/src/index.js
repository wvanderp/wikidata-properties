"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.siteDetails = exports.labelLanguages = exports.monolingualLanguages = exports.datatypeTypes = exports.getProperty = exports.properties = void 0;
var properties_json_1 = __importDefault(require("../data/properties.json"));
var datatypeTypes_json_1 = __importDefault(require("../data/datatypeTypes.json"));
var MonolingualLanguages_json_1 = __importDefault(require("../data/MonolingualLanguages.json"));
var LabelLanguages_json_1 = __importDefault(require("../data/LabelLanguages.json"));
var SiteDetails_json_1 = __importDefault(require("../data/SiteDetails.json"));
exports.properties = properties_json_1["default"];
var getProperty = function (propertyID) { var _a; return (_a = exports.properties.find(function (r) { return r.id === propertyID; })) !== null && _a !== void 0 ? _a : null; };
exports.getProperty = getProperty;
exports.datatypeTypes = datatypeTypes_json_1["default"];
exports.monolingualLanguages = MonolingualLanguages_json_1["default"];
exports.labelLanguages = LabelLanguages_json_1["default"];
exports.siteDetails = SiteDetails_json_1["default"];
//# sourceMappingURL=index.js.map