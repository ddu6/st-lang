"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOrbitsWithTag = exports.extractIdsWithIndex = exports.extractIdsWithTag = void 0;
const ston = require("ston");
const stdn = require("stdn");
function extractIdsWithTagFromSTDN(doc) {
    const out = [];
    for (const line of doc) {
        for (const unit of line) {
            if (typeof unit === 'string') {
                continue;
            }
            const { id } = unit.options;
            if (typeof id === 'string'
                && id.length > 0) {
                out.push({
                    value: id,
                    tag: unit.tag,
                    type: 'id',
                    originalString: id
                });
            }
            const rid = unit.options['ref-id'];
            if (typeof rid === 'string'
                && rid.length > 0) {
                out.push({
                    value: rid,
                    tag: unit.tag,
                    type: 'ref-id',
                    originalString: rid
                });
            }
            const { href } = unit.options;
            if (typeof href === 'string'
                && href.startsWith('#')) {
                out.push({
                    value: decodeURIComponent(href.slice(1)),
                    tag: unit.tag,
                    type: 'href',
                    originalString: href
                });
            }
            for (const key of Object.keys(unit.options)) {
                const value = unit.options[key];
                if (typeof value === 'object') {
                    out.push(...extractIdsWithTagFromSTDN(value));
                }
            }
            out.push(...extractIdsWithTagFromSTDN(unit.children));
        }
    }
    return out;
}
function extractIdsWithTag(string) {
    const doc = stdn.parse(string);
    if (doc === undefined) {
        return [];
    }
    return extractIdsWithTagFromSTDN(doc);
}
exports.extractIdsWithTag = extractIdsWithTag;
function extractIdsWithIndexFromSTONArrayValueWithIndex(array) {
    const out = [];
    for (const { value } of array) {
        if (typeof value !== 'object') {
            continue;
        }
        if (Array.isArray(value)) {
            out.push(...extractIdsWithIndexFromSTONArrayValueWithIndex(value));
            continue;
        }
        out.push(...extractIdsWithIndexFromSTONObjectValueWithIndex(value));
    }
    return out;
}
function extractIdsWithIndexFromSTONObjectValueWithIndex(object) {
    var _a;
    const out = [];
    const { id } = object;
    if (id !== undefined
        && typeof id.value === 'string'
        && id.value.length > 0) {
        out.push({
            value: id.value,
            index: id.index,
            type: 'id',
            originalString: id.value
        });
    }
    const rid = object['ref-id'];
    if (rid !== undefined
        && typeof rid.value === 'string'
        && rid.value.length > 0) {
        out.push({
            value: rid.value,
            index: rid.index,
            type: 'ref-id',
            originalString: rid.value
        });
    }
    const { href } = object;
    if (href !== undefined
        && typeof href.value === 'string'
        && href.value.startsWith('#')) {
        out.push({
            value: decodeURIComponent(href.value.slice(1)),
            index: href.index,
            type: 'href',
            originalString: href.value
        });
    }
    for (const key of Object.keys(object)) {
        const value = ((_a = object[key]) !== null && _a !== void 0 ? _a : {}).value;
        if (typeof value !== 'object') {
            continue;
        }
        if (Array.isArray(value)) {
            out.push(...extractIdsWithIndexFromSTONArrayValueWithIndex(value));
            continue;
        }
        out.push(...extractIdsWithIndexFromSTONObjectValueWithIndex(value));
    }
    return out;
}
function extractIdsWithIndex(string) {
    const result = ston.parseWithIndex('[' + string + ']', -1);
    if (result === undefined
        || !Array.isArray(result.value)) {
        return [];
    }
    return extractIdsWithIndexFromSTONArrayValueWithIndex(result.value);
}
exports.extractIdsWithIndex = extractIdsWithIndex;
function extractOrbitsWithTagFromSTDN(doc) {
    const out = [];
    const orbitSet = {};
    for (const line of doc) {
        for (const unit of line) {
            if (typeof unit === 'string') {
                continue;
            }
            const { orbit } = unit.options;
            if (typeof orbit === 'string'
                && orbit.length > 0
                && orbitSet[orbit] === undefined) {
                out.push({
                    value: orbit,
                    tag: unit.tag,
                });
                orbitSet[orbit] = true;
            }
            for (const key of Object.keys(unit.options)) {
                const value = unit.options[key];
                if (typeof value === 'object') {
                    out.push(...extractOrbitsWithTagFromSTDN(value));
                }
            }
            out.push(...extractOrbitsWithTagFromSTDN(unit.children));
        }
    }
    return out;
}
function extractOrbitsWithTag(string) {
    const doc = stdn.parse(string);
    if (doc === undefined) {
        return [];
    }
    return extractOrbitsWithTagFromSTDN(doc);
}
exports.extractOrbitsWithTag = extractOrbitsWithTag;
//# sourceMappingURL=extract.js.map