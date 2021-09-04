import * as vscode from 'vscode'
import {cmds} from './katex'
import * as ston from 'ston'
import * as stdn from 'stdn'
import { IdType, extractIdsWithTag, extractIdsWithIndex, extractOrbitsWithTag } from './extract'
import { URL } from 'url'
function producePreviewHTML(src:string,focusURL:string,focusLine:number){
    return `<!DOCTYPE html>
    <html style="background:black" data-src=${
        JSON.stringify(src+'?r='+Math.random())
    } data-focus-url=${
        JSON.stringify(focusURL)
    } data-focus-line=${focusLine}>
        <body>
            <style>
                body{
                    color:inherit;
                    font:inherit;
                    padding:0;
                }
                blockquote{
                    background:inherit;
                }
                code{
                    color:inherit;
                }
                kbd{
                    background:inherit;
                    color:inherit;
                    vertical-align:baseline;
                }
            </style>
            <script type="module" src="https://cdn.jsdelivr.net/gh/st-org/st-view@0.2.4/dist/main.js"></script>
            <script type="module">
                const vscode = acquireVsCodeApi()
                window.viewer.dblClickLineListeners.push((line,url,partialLine)=>{
                    vscode.postMessage({
                        line,url,partialLine
                    })
                })
            </script>
        </body>
    </html>`
}
function getCurrentLine(editor:vscode.TextEditor){
    return Math.max(0,(stdn.parse(editor.document.getText(new vscode.Range(
        new vscode.Position(0,0),
        editor.visibleRanges[0].start
    )))??[]).length-1)
}
function getStringRange(document:vscode.TextDocument,index:number,string:string){
    const start=document.positionAt(index)
    let range=new vscode.Range(start,document.positionAt(index+1))
    if(document.getText(range)!=="'"){
        return new vscode.Range(start,document.positionAt(index+string.length))
    }
    const max=2*string.length+2+index
    for(let i=index+1;i<max;i++){
        const char=document.getText(new vscode.Range(document.positionAt(i),document.positionAt(i+1)))
        if(char!=="'"){
            continue
        }
        range=new vscode.Range(start,document.positionAt(i+1))
        const string=document.getText(range)
        if(ston.parse(string)===string){
            break
        }
    }
    return range
}
function getIdAtPosition(document:vscode.TextDocument,position:vscode.Position){
    const text=document.getText()
    const result=extractIdsWithIndex(text)
    let id=''
    let index=0
    let type:IdType='id'
    let originalString=''
    for(let i=0;i<result.length;i++){
        const item=result[i]
        const idPosition=document.positionAt(item.index)
        if(
            idPosition.line>position.line
            ||idPosition.line<position.line
        ){
            continue
        }
        if(idPosition.character>position.character){
            break
        }
        id=item.value
        index=item.index
        type=item.type
        originalString=item.originalString
    }
    return {
        id,
        index,
        type,
        originalString,
        idsWithIndex:result
    }
}
export function activate(context: vscode.ExtensionContext) {
	const backslash = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/\\[a-zA-Z]*/)===undefined){
                return []
            }
            return cmds.map(val=>new vscode.CompletionItem(val,2))
        }
    },'\\')
    const idHover=vscode.languages.registerHoverProvider('stdn',{
        async provideHover(document,position){
            if(document.getWordRangeAtPosition(position,/(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/)===undefined){
                return undefined
            }
            const {id,index,originalString}=getIdAtPosition(document,position)
            if(id===''){
                return undefined
            }
            const contents=extractIdsWithTag(document.getText())
            .filter(val=>val.value===id)
            .map(val=>val.tag)
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                contents.push(
                    ...extractIdsWithTag(otherDocument.getText())
                    .filter(val=>val.value===id)
                    .map(val=>`${val.tag} ${uri.path}`)
                )
            }
            return new vscode.Hover(contents,getStringRange(document,index,originalString))
        }
    })
    const ridCompletion = vscode.languages.registerCompletionItemProvider('stdn',{
        async provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/ref-id[ ]/)===undefined){
                return []
            }
            const out=extractIdsWithTag(document.getText())
            .filter(val=>val.type==='id')
            .map(val=>new vscode.CompletionItem({
                label:ston.stringify(val.value,{useUnquotedString:true}),
                detail:val.tag
            },17))
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                out.push(
                    ...extractIdsWithTag(otherDocument.getText())
                    .filter(val=>val.type==='id')
                    .map(val=>new vscode.CompletionItem({
                        label:ston.stringify(val.value,{useUnquotedString:true}),
                        detail:val.tag,
                        description:uri.path
                    },17))
                )
            }
            return out
        }
    }," ")
    const hrefCompletion = vscode.languages.registerCompletionItemProvider('stdn',{
        async provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/href[ ]/)===undefined){
                return []
            }
            const out=extractIdsWithTag(document.getText())
            .filter(val=>val.type==='id')
            .map(val=>new vscode.CompletionItem({
                label:ston.stringify('#'+encodeURIComponent(val.value),{useUnquotedString:true}),
                detail:val.tag
            },17))
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                out.push(
                    ...extractIdsWithTag(otherDocument.getText())
                    .filter(val=>val.type==='id')
                    .map(val=>new vscode.CompletionItem({
                        label:ston.stringify('#'+encodeURIComponent(val.value),{useUnquotedString:true}),
                        detail:val.tag,
                        description:uri.path
                    },17))
                )
            }
            return out
        }
    }," ")
    const orbitCompletion = vscode.languages.registerCompletionItemProvider('stdn',{
        async provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/orbit[ ]/)===undefined){
                return []
            }
            const out=[
                'heading',
                'equation',
                'figure',

                'conjecture',
                'corollary',
                'definition',
                'example',
                'exercise',
                'lemma',
                'notation',
                'proposition',
                'remark',
                'theorem',
            ].map(val=>new vscode.CompletionItem({
                label:val,
            },11))
            .concat(
                extractOrbitsWithTag(document.getText())
                .map(val=>new vscode.CompletionItem({
                    label:ston.stringify(val.value,{useUnquotedString:true}),
                    detail:val.tag
                },11))
            )
            return out
        }
    }," ")
    const idReference=vscode.languages.registerReferenceProvider('stdn',{
        async provideReferences(document,position){
            if(document.getWordRangeAtPosition(position,/(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/)===undefined){
                return []
            }
            const {id,idsWithIndex}=getIdAtPosition(document,position)
            if(id===''){
                return []
            }
            const out=idsWithIndex
            .filter(val=>val.value===id)
            .map(val=>new vscode.Location(document.uri,getStringRange(document,val.index,val.originalString)))
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                out.push(
                    ...extractIdsWithIndex(otherDocument.getText())
                    .filter(val=>val.value===id)
                    .map(val=>new vscode.Location(otherDocument.uri,getStringRange(otherDocument,val.index,val.originalString)))
                )
            }
            return out
        }
    })
    const idRename=vscode.languages.registerRenameProvider('stdn',{
        prepareRename(document,position){
            if(document.getWordRangeAtPosition(position,/(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/)===undefined){
                return undefined
            }
            const {id,index,originalString}=getIdAtPosition(document,position)
            if(id===''){
                return undefined
            }
            return {
                range:getStringRange(document,index,originalString),
                placeholder:id
            }
        },
        async provideRenameEdits(document,position,newName){
            const edit=new vscode.WorkspaceEdit()
            if(document.getWordRangeAtPosition(position,/(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/)===undefined){
                return edit
            }
            const {id,idsWithIndex}=getIdAtPosition(document,position)
            if(id===''){
                return edit
            }
            const idStr=ston.stringify(newName,{useUnquotedString:true})
            const hrefStr=ston.stringify('#'+encodeURIComponent(newName),{useUnquotedString:true})
            idsWithIndex
            .filter(val=>val.value===id)
            .forEach(val=>{
                edit.replace(document.uri,getStringRange(document,val.index,val.originalString),val.type==='href'?hrefStr:idStr)
            })
            return edit
        }
    })
    const formatSTDN=vscode.languages.registerDocumentFormattingEditProvider('stdn',{
        provideDocumentFormattingEdits(document){
            const string=document.getText()
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(new vscode.Position(0,0),document.positionAt(string.length)),
                    stdn.format(string)
                )
            ]
        }
    })
    const formatURLs=vscode.languages.registerDocumentFormattingEditProvider('urls',{
        provideDocumentFormattingEdits(document){
            const string=document.getText()
            const result=ston.parseWithIndex('['+string+']')
            if(result===undefined){
                return []
            }
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(new vscode.Position(0,0),document.positionAt(string.length)),
                    ston.stringifyWithComment(result.value,{
                        indentLevel:-1,
                        indentTarget:'all',
                        useUnquotedString:true,
                    }).slice(2,-2)
                )
            ]
        }
    })
    const formatSTON=vscode.languages.registerDocumentFormattingEditProvider('ston',{
        provideDocumentFormattingEdits(document){
            const string=document.getText()
            const result=ston.parseWithIndex(string)
            if(result===undefined){
                return []
            }
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(new vscode.Position(0,0),document.positionAt(string.length)),
                    ston.stringifyWithComment(result.value,{
                        indentTarget:'all',
                        addDecorativeSpace:'always',
                        useUnquotedString:true,
                    })
                )
            ]
        }
    })
    const preview=vscode.commands.registerTextEditorCommand('st-lang.preview',(editor)=>{
        if(
            editor.document.languageId!=='stdn'
            &&editor.document.languageId!=='urls'
        ){
            return
        }
        let focusLine=0
        if(editor.document.languageId==='stdn'){
            focusLine=getCurrentLine(editor)
        }
        const panel = vscode.window.createWebviewPanel(
            'st-lang.preview',
            editor.document.uri.path.replace(/^.*\//,''),
            vscode.ViewColumn.Beside,
            {
                enableScripts:true
            }
        )
        const src=panel.webview.asWebviewUri(editor.document.uri).toString()
        panel.webview.html=producePreviewHTML(src,'',focusLine)
        const t=vscode.workspace.onDidSaveTextDocument(document=>{
            let focusURL=''
            let focusLine=0
            const editor=vscode.window.activeTextEditor
            if(editor===undefined||editor.document!==document){
                return
            }
            if(document.languageId==='stdn'){
                focusURL=panel.webview.asWebviewUri(document.uri).toString()
                focusLine=getCurrentLine(editor)
            }
            panel.webview.html=producePreviewHTML(src,focusURL,focusLine)
        },undefined,context.subscriptions)
        panel.onDidDispose(()=>{
            t.dispose()
        },undefined,context.subscriptions)
        panel.webview.onDidReceiveMessage(message=>{
            const tmp0=new URL(message.url)
            for(const editor of vscode.window.visibleTextEditors){
                if(editor.document.languageId!=='stdn'){
                    continue
                }
                const tmp1=new URL(panel.webview.asWebviewUri(editor.document.uri).toString())
                if(tmp1.origin!==tmp0.origin||tmp1.pathname!==tmp0.pathname){
                    continue
                }
                const result=ston.parseWithIndex('['+editor.document.getText()+']',-1)
                if(
                    result===undefined
                    ||!Array.isArray(result.value)
                ){
                    return
                }
                let lineCount=0
                for(let i=0;i<result.value.length;i++){
                    const {value,index}=result.value[i]
                    if(typeof value==='object'){
                        lineCount++
                    }else if(typeof value!=='string'){
                        continue
                    }else{
                        lineCount+=value.split('\n').length
                    }
                    if(lineCount<=message.partialLine){
                        continue
                    }
                    const position=editor.document.positionAt(index)
                    editor.revealRange(new vscode.Range(position,position),3)
                    return
                }
            }
        },undefined,context.subscriptions)
    })
    const stringify=vscode.commands.registerTextEditorCommand('st-lang.stringify',(editor,edit)=>{
        if(
            editor.document.languageId!=='stdn'
            &&editor.document.languageId!=='urls'
            &&editor.document.languageId!=='ston'
            ||editor.selection.isEmpty
        ){
            return
        }
        edit.replace(
            editor.selection,
            editor.document.getText(editor.selection)
            .split('\n').map(val=>ston.stringify(val)).join('\n')
        )
    })
    const copyStringifyResult=vscode.commands.registerTextEditorCommand('st-lang.copy-stringify-result',(editor)=>{
        if(
            editor.document.languageId!=='stdn'
            &&editor.document.languageId!=='urls'
            &&editor.document.languageId!=='ston'
            ||editor.selection.isEmpty
        ){
            return
        }
        vscode.env.clipboard.writeText(
            editor.document.getText(editor.selection)
            .split('\n').map(val=>ston.stringify(val)).join('\n')
        )
    })
    const copyId=vscode.commands.registerTextEditorCommand('st-lang.copy-id',(editor)=>{
        if(
            editor.document.languageId!=='stdn'
            &&editor.document.languageId!=='urls'
            &&editor.document.languageId!=='ston'
            ||editor.selection.isEmpty
        ){
            return
        }
        vscode.env.clipboard.writeText(
            editor.document.getText(editor.selection)
            .split(/\s+/).map(val=>val.toLowerCase()).join('-')
        )
    })
	context.subscriptions.push(backslash,idHover,ridCompletion,hrefCompletion,orbitCompletion,idReference,idRename,formatSTDN,formatURLs,formatSTON,preview,stringify,copyStringifyResult,copyId)
}
export function deactivate() {}