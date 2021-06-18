export type JSONObject={
    [key:string]:(JSONObject|JSONArray|string|number|boolean)
}
export type JSONArray=(JSONObject|JSONArray|string|number|boolean)[]
function splitToArray(string:string,keepKey=false):string[]{
    let count=0,quote=false,escape=false,last=0,comment:false|'line'|'block'=false
    const array=[]
    for(let i=0;i<string.length;i++){
        if(escape===true){
            escape=false
            continue
        }
        const char=string[i]
        if(comment==='line'){
            if(char==='\n'){
                comment=false
            }
            last=i+1
            continue
        }
        if(comment==='block'){
            if(char==='*'){
                const next=string[i+1]
                if(next==='/'){
                    i++
                    comment=false
                }
            }
            last=i+1
            continue
        }
        if(char==="'"){
            if(!quote){
                quote=true
                if(count===0&&!keepKey){
                    const tmp=string.slice(last,i).trim()
                    last=i
                    if(tmp!==''){
                        array.push(tmp)
                    }
                }
                continue
            }
            quote=false
            if(count===0){
                array.push(string.slice(last,i+1))
                last=i+1
            }
            continue
        }
        if(quote){
            if(char==='\\'){
                escape=true
                continue
            }
            continue
        }
        if(char==='{'||char==='['){
            count++
            if(count===1&&!keepKey){
                const tmp=string.slice(last,i).trim()
                last=i
                if(tmp!==''){
                    array.push(tmp)
                }
            }
            continue
        }
        if(char==='}'||char===']'){
            count--
            if(count<0){
                const tmp=string.slice(last,i).trim()
                if(tmp!==''){
                    array.push(tmp)
                }
                break
            }
            if(count===0){
                array.push(string.slice(last,i+1))
                last=i+1
            }
            continue
        }
        if(count>0)continue
        if(char===','||char==='\n'){
            const tmp=string.slice(last,i).trim()
            last=i+1
            if(tmp!==''){
                array.push(tmp)
            }
            continue
        }
        if(last<i)continue
        if(char.trim()===''){
            last=i+1
            continue
        }
        if(char==='/'){
            const next=string[i+1]
            if(next==='/'){
                i++
                comment='line'
                last=i+1
                continue
            }
            if(next==='*'){
                i++
                comment='block'
                last=i+1
                continue
            }
        }
    }
    if(!quote&&count===0){
        const tmp=string.slice(last).trim()
        if(tmp!==''){
            array.push(tmp)
        }
    }
    return array
}
function tempArrayToJSONArray(array:string[]){
    const out:JSONArray=[]
    for(let i=0;i<array.length;i++){
        const json=parse(array[i])
        if(json===undefined)return undefined
        out.push(json)
    }
    return out
}
function tempArrayToJSONObject(array:string[]){
    const out:JSONObject={}
    for(let i=0;i<array.length;i++){
        const string=array[i].trimStart()
        const result=string.match(/^\w[\w-]*/)
        if(result===null){
            const json=parse(string)
            if(json===undefined)return undefined
            out.__=json
            continue
        }
        const key=result[0]
        let valStr=string.slice(key.length).trimStart()
        if(valStr.startsWith(':')){
            valStr=valStr.slice(1).trimStart()
        }
        if(valStr===''){
            out[key]=true
        }else{
            const value=parse(valStr)
            if(value===undefined)return undefined
            out[key]=value
        }
    }
    return out
}
function parseToString(string:string):string{
    const array:string[]=[]
    let escape:boolean=false
    for(let i=0;i<string.length;i++){
        const char=string[i]
        if(escape===true){
            escape=false
            if(char!=='\\'&&char!=="'")array.push('\\')
            array.push(char)
            continue
        }
        if(char==='\\'){
            escape=true
            continue
        }
        if(char==="'")break
        array.push(char)
    }
    return array.join('')
}
function parseToArray(string:string){
    return tempArrayToJSONArray(splitToArray(string))
}
function parseToObject(string:string){
    return tempArrayToJSONObject(splitToArray(string,true))
}
export function parse(string:string):JSONObject|JSONArray|string|number|boolean|undefined{
    string=string.trimStart()
    if(string==='')return undefined
    const start=string[0]
    if(start==="'")return parseToString(string.slice(1))
    if(start==='[')return parseToArray(string.slice(1))
    if(start==='{')return parseToObject(string.slice(1))
    string=string.trimEnd()
    if(string==='true')return true
    if(string==='false')return false
    if(/^(?:[+-]?Infinity|NaN|0x[\da-fA-F]+|0o[0-7]+|0b[01]+|[+-]?(?:\d*\.?\d+|\d+\.)(?:e[+-]?\d+)?)$/.test(string)){
        return Number(string)
    }
    if(/[',{}\[\]\n\r]/.test(string)){
        return undefined
    }
    return string
}
function stringifyString(string:string):string{
    return "'"+string.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/(^|[^\\])\\\\(?=[^\\"'])/g,'$1\\')+"'"
}
type BeautifyTarget='array'|'object'|'all'|'none'|'arrayInObject'|'arrayInObjectAndThis'
function stringifyArray(array:JSONArray,beautify:BeautifyTarget,level=1):string{
    const out:string[]=[]
    const expand=array.length>1&&(beautify==='all'||beautify==='array'||beautify==='arrayInObjectAndThis')
    if(beautify==='arrayInObjectAndThis'){
        beautify='arrayInObject'
    }
    for(let i=0;i<array.length;i++){
        const string=stringify(array[i],beautify,level+(expand?1:0))
        if(
            string.endsWith("'")||string.endsWith('}')||string.endsWith(']')
            ||i===(array.length-1)||expand
        ){
            out.push(string)
        }else{
            out.push(string+',')
        }
    }
    let add=''
    for(let i=1;i<level;i++){
        add+='    '
    }
    if(expand){
        return '['+'\n    '+add+out.join('\n    '+add)+'\n'+add+']'
    }else{
        return '['+out.join('')+']'
    }
}
function stringifyObject(object:JSONObject,beautify:BeautifyTarget,level=1):string{
    const out:string[]=[]
    const keys=Object.keys(object)
    const expand=keys.length>1&&(beautify==='all'||beautify==='object')
    if(beautify==='arrayInObject'){
        beautify='arrayInObjectAndThis'
    }
    for(let i=0;i<keys.length;i++){
        const key=keys[i]
        const result=key.match(/^\w[\w-]*$/)
        if(result===null)continue
        const value=object[key]
        const string=stringify(value,beautify,level+(expand?1:0))
        if(string.startsWith('\'')||string.startsWith('[')||string.startsWith('{')){
            out.push((key==='__'?'':key)+string)
        }else if(string==='true'){
            if(i===(keys.length-1)||expand){
                out.push(key)
            }else{
                out.push(key+',')
            }
        }else{
            if(
                string.endsWith("'")||string.endsWith('}')||string.endsWith(']')
                ||i===(keys.length-1)||expand
            ){
                out.push(key+' '+string)
            }else{
                out.push(key+' '+string+',')
            }
        }
    }
    let add=''
    for(let i=1;i<level;i++){
        add+='    '
    }
    if(expand){
        return '{'+'\n    '+add+out.join('\n    '+add)+'\n'+add+'}'
    }else{
        return '{'+out.join('')+'}'
    }
}
export function stringify(json:JSONObject|JSONArray|string|number|boolean,beautify:BeautifyTarget='none',level=1){
    if(typeof json==='number')return json.toString()
    if(typeof json==='string')return stringifyString(json)
    if(json===true)return 'true'
    if(json===false)return 'false'
    if(Array.isArray(json))return stringifyArray(json,beautify,level)
    return stringifyObject(json,beautify,level)
}