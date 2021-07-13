import * as ston from 'ston'
import * as stdn from 'stdn'
export function extractLabels(string:string){
    const result=stdn.parse(string)
    if(result===undefined){
        return []
    }
    const out:string[]=[]
    const labelSet:{
        [key:string]:true|undefined
    }={}
    for(let i=0;i<result.length;i++){
        const line=result[i]
        for(let i=0;i<line.length;i++){
            const unit=line[i]
            if(typeof unit==='string'){
                continue
            }
            const {label}=unit.options
            if(
                typeof label!=='string'
                ||label===''
                ||labelSet[label]===true
            ){
                continue
            }
            labelSet[label]=true
            out.push(label)
        }
    }
    return out
}
export function extractLabelsWithIndex(string:string){
    const result=ston.parseWithIndex('['+string+']',-1)
    if(
        result===undefined
        ||!Array.isArray(result.value)
    ){
        return []
    }
    return extractLabelsWithIndexFromSTONArrayValueWithIndex(result.value)
}
function extractLabelsWithIndexFromSTONArrayValueWithIndex(array:ston.STONArrayValueWithIndex){
    const out:{
        value:string
        index:number
    }[]=[]
    for(let i=0;i<array.length;i++){
        const {value}=array[i]
        if(typeof value!=='object'){
            continue
        }
        if(Array.isArray(value)){
            out.push(...extractLabelsWithIndexFromSTONArrayValueWithIndex(value))
            continue
        }
        const {label}=value
        if(
            label===undefined
            ||typeof label.value!=='string'
            ||label.value===''
        ){
            continue
        }
        out.push({value:label.value,index:label.index})
    }
    return out
}