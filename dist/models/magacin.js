"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Magacin = new Schema({
    codeOfProd: {
        type: String
    },
    name: {
        type: String
    },
    company: {
        type: String
    },
    amount: {
        type: String
    },
    type: {
        type: String
    },
    arrived: {
        type: Boolean
    },
    owner: {
        type: String
    },
    garden: {
        type: String
    },
    buy: {
        type: Date,
        default: Date.now()
    }
});
exports.default = mongoose_1.default.model('magacin', Magacin);
//# sourceMappingURL=magacin.js.map