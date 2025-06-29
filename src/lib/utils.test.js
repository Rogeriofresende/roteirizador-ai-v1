"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var utils_1 = require("./utils");
(0, vitest_1.describe)('cn utility', function () {
    (0, vitest_1.it)('should merge classes correctly', function () {
        (0, vitest_1.expect)((0, utils_1.cn)('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });
    (0, vitest_1.it)('should handle conditional classes', function () {
        (0, vitest_1.expect)((0, utils_1.cn)('base', { conditional: true })).toBe('base conditional');
        (0, vitest_1.expect)((0, utils_1.cn)('base', { conditional: false })).toBe('base');
    });
    (0, vitest_1.it)('should override conflicting tailwind classes', function () {
        (0, vitest_1.expect)((0, utils_1.cn)('p-4', 'p-2')).toBe('p-2');
        (0, vitest_1.expect)((0, utils_1.cn)('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
    (0, vitest_1.it)('should handle various types of inputs', function () {
        (0, vitest_1.expect)((0, utils_1.cn)('a', null, undefined, 'b', false, { c: true, d: false })).toBe('a b c');
    });
});
