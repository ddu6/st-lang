import * as ston from 'ston'
import {parse, STDN} from 'stdn'
export type IdType = 'id' | 'ref-id' | 'href'
function extractIdsFromSTDN(stdn: STDN) {
    const out: {
        value: string
        tag: string
        type: IdType
        originalString: string
    }[] = []
    for (const line of stdn) {
        for (const unit of line) {
            if (typeof unit === 'string') {
                continue
            }
            const {id} = unit.options
            if (
                typeof id === 'string'
                && id.length > 0
            ) {
                out.push({
                    value: id,
                    tag: unit.tag,
                    type: 'id',
                    originalString: id
                })
            }
            const rid = unit.options['ref-id']
            if (
                typeof rid === 'string'
                && rid.length > 0
            ) {
                out.push({
                    value: rid,
                    tag: unit.tag,
                    type: 'ref-id',
                    originalString: rid
                })
            }
            const {href} = unit.options
            if (
                typeof href === 'string'
                && href.startsWith('#')
            ) {
                out.push({
                    value: decodeURIComponent(href.slice(1)),
                    tag: unit.tag,
                    type: 'href',
                    originalString: href
                })
            }
            for (const key in unit.options) {
                const value = unit.options[key]
                if (typeof value === 'object') {
                    out.push(...extractIdsFromSTDN(value))
                }
            }
            out.push(...extractIdsFromSTDN(unit.children))
        }
    }
    return out
}
export function extractIdsWithTag(string: string) {
    const stdn = parse(string)
    if (stdn === undefined) {
        return []
    }
    return extractIdsFromSTDN(stdn)
}
function extractIdsFromSTONArrayWithIndexValue(array: ston.STONArrayWithIndexValue) {
    const out: {
        value: string
        index: number
        type: 'id' | 'ref-id' | 'href'
        originalString: string
    }[] = []
    for (const {value} of array) {
        if (typeof value !== 'object') {
            continue
        }
        if (Array.isArray(value)) {
            out.push(...extractIdsFromSTONArrayWithIndexValue(value))
            continue
        }
        out.push(...extractIdsFromSTONObjectWithIndexValue(value))
    }
    return out
}
function extractIdsFromSTONObjectWithIndexValue(object: ston.STONObjectWithIndexValue) {
    const out: {
        value: string
        index: number
        type: 'id' | 'ref-id' | 'href'
        originalString: string
    }[] = []
    const {id} = object
    if (
        id !== undefined
        && typeof id.value === 'string'
        && id.value.length > 0
    ) {
        out.push({
            value: id.value,
            index: id.index,
            type: 'id',
            originalString: id.value
        })
    }
    const rid = object['ref-id']
    if (
        rid !== undefined
        && typeof rid.value === 'string'
        && rid.value.length > 0
    ) {
        out.push({
            value: rid.value,
            index: rid.index,
            type: 'ref-id',
            originalString: rid.value
        })
    }
    const {href} = object
    if (
        href !== undefined
        && typeof href.value === 'string'
        && href.value.startsWith('#')
    ) {
        out.push({
            value: decodeURIComponent(href.value.slice(1)),
            index: href.index,
            type: 'href',
            originalString: href.value
        })
    }
    for (const key in object) {
        const value = object[key]
        if (value === undefined || typeof value.value !== 'object') {
            continue
        }
        if (Array.isArray(value.value)) {
            out.push(...extractIdsFromSTONArrayWithIndexValue(value.value))
            continue
        }
        out.push(...extractIdsFromSTONObjectWithIndexValue(value.value))
    }
    return out
}
export function extractIdsWithIndex(string: string) {
    const result = ston.parseWithIndex(`[${string}]`, -1)
    if (
        result === undefined
        || !Array.isArray(result.value)
    ) {
        return []
    }
    return extractIdsFromSTONArrayWithIndexValue(result.value)
}
function extractOrbitsFromSTDN(stdn: STDN) {
    const out: {
        value: string
        tag: string
    }[] = []
    const orbitSet: Record<string, true | undefined> = {}
    for (const line of stdn) {
        for (const unit of line) {
            if (typeof unit === 'string') {
                continue
            }
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
                    out.push(...extractOrbitsFromSTDN(value))
                }
            }
            out.push(...extractOrbitsFromSTDN(unit.children))
        }
    }
    return out
}
export function extractOrbitsWithTag(string: string) {
    const stdn = parse(string)
    if (stdn === undefined) {
        return []
    }
    return extractOrbitsFromSTDN(stdn)
}