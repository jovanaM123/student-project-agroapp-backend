"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Garden = new Schema({
    owner: {
        type: String
    },
    name: {
        type: String
    },
    place: {
        type: String
    },
    sadn: {
        type: String
    },
    totalSadn: {
        type: String
    },
    h20: {
        type: String
    },
    temp: {
        type: String
    },
    width: {
        type: String
    },
    heigth: {
        type: String
    }
});
exports.default = mongoose_1.default.model('garden', Garden);
//# sourceMappingURL=garden.js.map