"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Firm = new Schema({
    name: {
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
    date: {
        type: Date
    },
    city: {
        type: String
    },
    approved: {
        type: Boolean
    }
});
exports.default = mongoose_1.default.model('firm', Firm);
//# sourceMappingURL=firm.js.map