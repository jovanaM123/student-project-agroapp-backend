"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
let Plant = new Schema({
    username: {
        type: String
    },
    name: {
        type: String
    },
    sadnica: {
        type: String
    },
    garden: {
        type: String
    },
    w: {
        type: String
    },
    h: {
        type: String
    },
    napredak: {
        type: String
    },
    spremna: {
        type: Boolean
    }
});
exports.default = mongoose_1.default.model('plant', Plant);
//# sourceMappingURL=plant.js.map