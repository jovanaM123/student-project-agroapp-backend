"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Jovana = new Schema({
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
    approved: {
        type: String
    }
});
exports.default = mongoose_1.default.model('jovana', Jovana);
//# sourceMappingURL=users.js.map