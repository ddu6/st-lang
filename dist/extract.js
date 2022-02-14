"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOrbits = exports.extractIds = void 0;
const stdn_1 = require("stdn");
function extractIdsFromUnitWithIndexValue({ tag: { value: tag }, options, children: { value: children } }) {
    const out = [];
    const object = options.value;
    const { id } = object;
    if (id !== undefined
        && typeof id.value === 'string'
        && id.value.length > 0) {
        out.push({
            index: id.index,
            originalString: id.value,
            tag,
            type: 'id',
            value: id.value
        });
    }
    const rid = object['ref-id'];
    if (rid !== undefined
        && typeof rid.value === 'string'
        && rid.value.length > 0) {
        out.push({
            index: rid.index,
            tag,
            type: 'ref-id',
            originalString: rid.value,
            value: rid.value
        });
    }
    const { href } = object;
    if (href !== undefined
        && typeof href.value === 'string'
        && href.value.startsWith('#')) {
        out.push({
            index: href.index,
            tag,
            type: 'href',
            originalString: href.value,
            value: decodeURIComponent(href.value.slice(1))
        });
    }
    for (const key in object) {
        const value = object[key];
        if (value !== undefined && typeof value.value === 'object') {
            out.push(...extractIdsFromUnitWithIndexValue(value.value));
        }
    }
    out.push(...extractIdsFromSTDNWithIndexValue(children));
    return out;
}
function extractIdsFromSTDNWithIndexValue(stdn) {
    const out = [];
    for (const line of stdn) {
        for (const { value } of line.value) {
            if (typeof value === 'object') {
                out.push(...extractIdsFromUnitWithIndexValue(value));
            }
        }
    }
    return out;
}
function extractIds(string) {
    const stdn = (0, stdn_1.parseWithIndex)(string);
    if (stdn === undefined) {
        return [];
    }
    return extractIdsFromSTDNWithIndexValue(stdn.value);
}
exports.extractIds = extractIds;
function extractOrbitsFromUnit(unit, orbitSet = {}) {
    const out = [];
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
    for (const key in unit.options) {
        const value = unit.options[key];
        if (typeof value === 'object') {
            out.push(...extractOrbitsFromUnit(value, orbitSet));
        }
    }
    out.push(...extractOrbitsFromSTDN(unit.children, orbitSet));
    return out;
}
function extractOrbitsFromSTDN(stdn, orbitSet = {}) {
    const out = [];
    for (const line of stdn) {
        for (const unit of line) {
            if (typeof unit === 'object') {
                out.push(...extractOrbitsFromUnit(unit, orbitSet));
            }
        }
    }
    return out;
}
function extractOrbits(string) {
    const stdn = (0, stdn_1.parse)(string);
    if (stdn === undefined) {
        return [];
    }
    return extractOrbitsFromSTDN(stdn);
}
exports.extractOrbits = extractOrbits;
