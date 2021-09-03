import * as ston from 'ston'
import * as stdn from 'stdn'
export type IdType='id'|'ref-id'|'href'
export function extractIdsWithTag(string:string){
    const result=stdn.parse(string)
    if(result===undefined){
        return []
    }
    const out:{
        value:string
        tag:string
        type:IdType
        originalString:string
    }[]=[]
    for(let i=0;i<result.length;i++){
        const line=result[i]
        for(let i=0;i<line.length;i++){
            const unit=line[i]
            if(typeof unit==='string'){
                continue
            }
            const {id}=unit.options
            if(
                typeof id==='string'
                &&id!==''
            ){
                out.push({
                    value:id,
                    tag:unit.tag,
                    type:'id',
                    originalString:id
                })
            }
            const rid=unit.options['ref-id']
            if(
                typeof rid==='string'
                &&rid!==''
            ){
                out.push({
                    value:rid,
                    tag:unit.tag,
                    type:'ref-id',
                    originalString:rid
                })
            }
            const {href}=unit.options
            if(
                typeof href==='string'
                &&href.startsWith('#')
            ){
                out.push({
                    value:decodeURIComponent(href.slice(1)),
                    tag:unit.tag,
                    type:'href',
                    originalString:href
                })
            }
        }
    }
    return out
}
export function extractIdsWithIndex(string:string){
    const result=ston.parseWithIndex('['+string+']',-1)
    if(
        result===undefined
        ||!Array.isArray(result.value)
    ){
        return []
    }
    return extractIdsWithIndexFromSTONArrayValueWithIndex(result.value)
}
function extractIdsWithIndexFromSTONArrayValueWithIndex(array:ston.STONArrayValueWithIndex){
    const out:{
        value:string
        index:number
        type:'id'|'ref-id'|'href'
        originalString:string
    }[]=[]
    for(let i=0;i<array.length;i++){
        const {value}=array[i]
        if(typeof value!=='object'){
            continue
        }
        if(Array.isArray(value)){
            out.push(...extractIdsWithIndexFromSTONArrayValueWithIndex(value))
            continue
        }
        const {id}=value
        if(
            id!==undefined
            &&typeof id.value==='string'
            &&id.value!==''
        ){
            out.push({
                value:id.value,
                index:id.index,
                type:'id',
                originalString:id.value
            })
        }
        const rid=value['ref-id']
        if(
            rid!==undefined
            &&typeof rid.value==='string'
            &&rid.value!==''
        ){
            out.push({
                value:rid.value,
                index:rid.index,
                type:'ref-id',
                originalString:rid.value
            })
        }
        const {href}=value
        if(
            href!==undefined
            &&typeof href.value==='string'
            &&href.value.startsWith('#')
        ){
            out.push({
                value:decodeURIComponent(href.value.slice(1)),
                index:href.index,
                type:'href',
                originalString:href.value
            })
        }
    }
    return out
}
export function extractOrbitsWithTag(string:string){
    const result=stdn.parse(string)
    if(result===undefined){
        return []
    }
    const out:{
        value:string
        tag:string
    }[]=[]
    const orbitSet:Record<string,true|undefined>={}
    for(let i=0;i<result.length;i++){
        const line=result[i]
        for(let i=0;i<line.length;i++){
            const unit=line[i]
            if(typeof unit==='string'){
                continue
            }
            const {orbit}=unit.options
            if(
                typeof orbit==='string'
                &&orbit!==''
                &&orbitSet[orbit]===undefined
            ){
                out.push({
                    value:orbit,
                    tag:unit.tag,
                })
                orbitSet[orbit]=true
            }
        }
    }
    return out
}