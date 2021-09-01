import * as vscode from 'vscode'
import {cmds} from './katex'
import * as ston from 'ston'
import * as stdn from 'stdn'
import { extractLabelsWithTag, extractLabelsWithIndex } from './label'
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
            <script type="module" src="https://cdn.jsdelivr.net/gh/st-org/st-view@0.1.3/dist/main.js"></script>
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
function getLabelRange(document:vscode.TextDocument,index:number,label:string){
    const start=document.positionAt(index)
    let range=new vscode.Range(start,document.positionAt(index+1))
    if(document.getText(range)!=="'"){
        return new vscode.Range(start,document.positionAt(index+label.length))
    }
    const max=2*label.length+2+index
    for(let i=index+1;i<max;i++){
        const char=document.getText(new vscode.Range(document.positionAt(i),document.positionAt(i+1)))
        if(char!=="'"){
            continue
        }
        range=new vscode.Range(start,document.positionAt(i+1))
        const string=document.getText(range)
        if(ston.parse(string)===label){
            break
        }
    }
    return range
}
function getLabelAtPosition(document:vscode.TextDocument,position:vscode.Position){
    const text=document.getText()
    const result=extractLabelsWithIndex(text)
    let label=''
    let index0=0
    for(let i=0;i<result.length;i++){
        const {value,index}=result[i]
        const labelPosition=document.positionAt(index)
        if(labelPosition.line<position.line){
            continue
        }
        if(
            labelPosition.line>position.line
            ||labelPosition.character>position.character+10
        ){
            break
        }
        label=value
        index0=index
    }
    return {
        label,
        index:index0,
        labelsWithIndex:result
    }
}
export function activate(context: vscode.ExtensionContext) {
	const backslash = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/\\[a-zA-Z]*/)===undefined){
                return []
            }
            return cmds.map(val=>new vscode.CompletionItem(val))
        }
    },'\\')
    const labelHover=vscode.languages.registerHoverProvider('stdn',{
        async provideHover(document,position){
            if(document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)===undefined){
                return undefined
            }
            const {label,index}=getLabelAtPosition(document,position)
            if(label===''){
                return undefined
            }
            const contents=extractLabelsWithTag(document.getText())
            .filter(val=>val.value===label)
            .map(val=>val.tag)
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                contents.push(
                    ...extractLabelsWithTag(otherDocument.getText())
                    .filter(val=>val.value===label)
                    .map(val=>`${val.tag} ${uri.path}`)
                )
            }
            return new vscode.Hover(contents,getLabelRange(document,index,label))
        }
    })
    const labelCompletion = vscode.languages.registerCompletionItemProvider('stdn',{
        async provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/label[ ]/)===undefined){
                return []
            }
            const out=extractLabelsWithTag(document.getText())
            .filter(val=>val.tag!=='ref')
            .map(val=>new vscode.CompletionItem({
                label:ston.stringify(val.value),
                detail:val.tag
            },17))
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                out.push(
                    ...extractLabelsWithTag(otherDocument.getText())
                    .filter(val=>val.tag!=='ref')
                    .map(val=>new vscode.CompletionItem({
                        label:ston.stringify(val.value),
                        detail:val.tag,
                        description:uri.path
                    },17))
                )
            }
            return out
        }
    }," ")
    const labelReference=vscode.languages.registerReferenceProvider('stdn',{
        async provideReferences(document,position){
            if(document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)===undefined){
                return []
            }
            const {label,labelsWithIndex}=getLabelAtPosition(document,position)
            if(label===''){
                return []
            }
            const out=labelsWithIndex
            .filter(val=>val.value===label)
            .map(val=>new vscode.Location(document.uri,getLabelRange(document,val.index,val.value)))
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                out.push(
                    ...extractLabelsWithIndex(otherDocument.getText())
                    .filter(val=>val.value===label)
                    .map(val=>new vscode.Location(otherDocument.uri,getLabelRange(otherDocument,val.index,val.value)))
                )
            }
            return out
        }
    })
    const labelRename=vscode.languages.registerRenameProvider('stdn',{
        prepareRename(document,position){
            if(document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)===undefined){
                return undefined
            }
            const {label,index}=getLabelAtPosition(document,position)
            if(label===''){
                return undefined
            }
            return {
                range:getLabelRange(document,index,label),
                placeholder:label
            }
        },
        async provideRenameEdits(document,position,newName){
            const edit=new vscode.WorkspaceEdit()
            if(document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)===undefined){
                return edit
            }
            const {label,labelsWithIndex}=getLabelAtPosition(document,position)
            if(label===''){
                return edit
            }
            newName=ston.stringify(newName)
            labelsWithIndex
            .filter(val=>val.value===label)
            .forEach(val=>{
                edit.replace(document.uri,getLabelRange(document,val.index,val.value),newName)
            })
            for(const uri of await vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')){
                const otherDocument =await vscode.workspace.openTextDocument(uri)
                if(otherDocument.languageId!=='stdn'||otherDocument.uri===document.uri){
                    continue
                }
                extractLabelsWithIndex(otherDocument.getText())
                .filter(val=>val.value===label)
                .forEach(val=>{
                    edit.replace(otherDocument.uri,getLabelRange(otherDocument,val.index,val.value),newName)
                })
            }
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
                        indentTarget:'all'
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
                        addDecorativeSpace:'always'
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
            .split('\n').map(val=>`'${val.replace(/'/g,"\\'")}'`).join('\n')
        )
    })
	context.subscriptions.push(backslash,labelHover,labelCompletion,labelReference,labelRename,formatSTDN,formatURLs,formatSTON,preview,stringify)
}
export function deactivate() {}