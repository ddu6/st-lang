import {parse, parseWithIndex, STDN, STDNUnit, STDNUnitWithIndexValue, STDNWithIndexValue} from 'stdn'
export type IdType = 'id' | 'ref-id' | 'href'
interface IdInfo {
    index: number
    originalString: string
    tag: string
    type: IdType
    value: string
}
function extractIdsFromUnitWithIndexValue({tag: {value: tag}, options, children: {value: children}}: STDNUnitWithIndexValue) {
    const out: IdInfo[] = []
    const object = options.value
    const {id} = object
    if (
        id !== undefined
        && typeof id.value === 'string'
        && id.value.length > 0
    ) {
        out.push({
            index: id.index,
            originalString: id.value,
            tag,
            type: 'id',
            value: id.value
        })
    }
    const rid = object['ref-id']
    if (
        rid !== undefined
        && typeof rid.value === 'string'
        && rid.value.length > 0
    ) {
        out.push({
            index: rid.index,
            tag,
            type: 'ref-id',
            originalString: rid.value,
            value: rid.value
        })
    }
    const {href} = object
    if (
        href !== undefined
        && typeof href.value === 'string'
        && href.value.startsWith('#')
    ) {
        out.push({
            index: href.index,
            tag,
            type: 'href',
            originalString: href.value,
            value: decodeURIComponent(href.value.slice(1))
        })
    }
    for (const key in object) {
        const value = object[key]
        if (value !== undefined && typeof value.value === 'object') {
            out.push(...extractIdsFromUnitWithIndexValue(value.value))
        }
    }
    out.push(...extractIdsFromSTDNWithIndexValue(children))
    return out
}
function extractIdsFromSTDNWithIndexValue(stdn: STDNWithIndexValue) {
    const out: IdInfo[] = []
    for (const line of stdn) {
        for (const {value} of line.value) {
            if (typeof value === 'object') {
                out.push(...extractIdsFromUnitWithIndexValue(value))
            }
        }
    }
    return out
}
export function extractIds(string: string) {
    const stdn = parseWithIndex(string)
    if (stdn === undefined) {
        return []
    }
    return extractIdsFromSTDNWithIndexValue(stdn.value)
}
interface OrbitInfo {
    tag: string
    value: string
}
interface OrbitSet {
    [key: string]: true | undefined
}
function extractOrbitsFromUnit(unit: STDNUnit, orbitSet: OrbitSet = {}) {
    const out: OrbitInfo[] = []
    const {orbit} = unit.options
    if (
        typeof orbit === 'string'
        && orbit.length > 0
        && orbitSet[orbit] === undefined
    ) {
        out.push({
            value: orbit,
            tag: unit.tag,
        })
        orbitSet[orbit] = true
    }
    for (const key in unit.options) {
        const value = unit.options[key]
        if (typeof value === 'object') {
            out.push(...extractOrbitsFromUnit(value, orbitSet))
        }
    }
    out.push(...extractOrbitsFromSTDN(unit.children, orbitSet))
    return out
}
function extractOrbitsFromSTDN(stdn: STDN, orbitSet: OrbitSet = {}) {
    const out: OrbitInfo[] = []
    for (const line of stdn) {
        for (const unit of line) {
            if (typeof unit === 'object') {
                out.push(...extractOrbitsFromUnit(unit, orbitSet))
            }
        }
    }
    return out
}
export function extractOrbits(string: string) {
    const stdn = parse(string)
    if (stdn === undefined) {
        return []
    }
    return extractOrbitsFromSTDN(stdn)
}