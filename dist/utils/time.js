"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneWeek = void 0;
const getOneWeek = () => {
    return new Date(Date.now() + 7 * 86400000);
};
exports.getOneWeek = getOneWeek;
