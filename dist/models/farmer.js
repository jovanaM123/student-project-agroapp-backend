"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Farmer = new Schema({
    name: {
        type: String
    },
    lastname: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    mail: {
        type: String
    },
    type: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    cityOfBirth: {
        type: String
    },
    phone: {
        type: String
    },
    approved: {
        type: Boolean
    }
});
exports.default = mongoose_1.default.model('farmer', Farmer);
//# sourceMappingURL=farmer.js.map