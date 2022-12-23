"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Comment = new Schema({
    codePr: {
        type: String
    },
    user: {
        type: String
    },
    rate: {
        type: String
    },
    comment: {
        type: String
    }
});
exports.default = mongoose_1.default.model('comment', Comment);
//# sourceMappingURL=comment.js.map