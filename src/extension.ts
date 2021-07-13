import * as vscode from 'vscode'
import {cmds} from './katex'
import * as ston from 'ston'
import * as stdn from 'stdn'
import { extractLabels, extractLabelsWithIndex } from './label'
function producePreviewHTML(src:string,focusURL:string,focusLine:number){
    return `<!DOCTYPE html>
    <body style="background:black" data-color-scheme="dark" data-src=${
        JSON.stringify(src+'?r='+Math.random())
    } data-focus-url=${
        JSON.stringify(focusURL)
    } data-focus-line=${focusLine}></body>
    <style>
        code{color:var(--color-text)}
    </style>
    <script type="module" src="https://cdn.jsdelivr.net/gh/ddu6/st-view@0.0.2/dist/main.js"></script>`
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
    const labelCompletion = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/label[ ]/)===undefined){
                return []
            }
            return extractLabels(document.getText())
            .map(val=>new vscode.CompletionItem(ston.stringify(val),17))
        }
    }," ")
    const labelReference=vscode.languages.registerReferenceProvider('stdn',{
        provideReferences(document,position){
            const range=document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)
            if(range===undefined){
                return []
            }
            const {label,labelsWithIndex}=getLabelAtPosition(document,position)
            if(label===''){
                return []
            }
            return labelsWithIndex
            .filter(val=>val.value===label)
            .map(val=>new vscode.Location(document.uri,getLabelRange(document,val.index,val.value)))
        }
    })
    const labelRename=vscode.languages.registerRenameProvider('stdn',{
        prepareRename(document,position){
            const range=document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)
            if(range===undefined){
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
        provideRenameEdits(document,position,newName){
            const edit=new vscode.WorkspaceEdit()
            const range=document.getWordRangeAtPosition(position,/label[ ]*'.+'|label[ ][^'{}\[\],]+/)
            if(range===undefined){
                return edit
            }
            const {label,labelsWithIndex}=getLabelAtPosition(document,position)
            if(label===''){
                return edit
            }
            labelsWithIndex
            .filter(val=>val.value===label)
            .forEach(val=>{
                edit.replace(document.uri,getLabelRange(document,val.index,val.value),ston.stringify(newName))
            })
            return edit
        }
    })
    const format=vscode.languages.registerDocumentFormattingEditProvider('stdn',{
        provideDocumentFormattingEdits(document){
            const string=document.getText()
            const result=stdn.parse(string)
            if(result===undefined){
                return []
            }
            return [
                vscode.TextEdit.replace(
                    new vscode.Range(new vscode.Position(0,0),document.positionAt(string.length)),
                    stdn.stringify(result)
                )
            ]
        }
    })
    const preview=vscode.commands.registerTextEditorCommand('stLang.preview',(editor,edit)=>{
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
            'stLang.preview',
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
        })
        panel.onDidDispose(()=>{
            t.dispose()
        })
    })
	context.subscriptions.push(backslash,labelCompletion,labelReference,labelRename,format,preview)
}
export function deactivate() {}