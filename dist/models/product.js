"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Product = new Schema({
    codePr: {
        type: String
    },
    name: {
        type: String
    },
    owner: {
        type: String
    },
    type: {
        type: String
    },
    amount: {
        type: String
    },
    avRate: {
        type: String
    },
    price: {
        type: String
    },
    description: {
        type: String
    },
    neSmePored: {
        type: String
    }
});
exports.default = mongoose_1.default.model('product', Product);
//# sourceMappingURL=product.js.map