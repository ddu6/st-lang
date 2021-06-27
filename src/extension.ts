import * as vscode from 'vscode'
import {cmds} from './katex'
import {stringify,parse} from 'ston'
export function activate(context: vscode.ExtensionContext) {
	const backslash = vscode.languages.registerCompletionItemProvider('st', {
        provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/\\[a-zA-Z]*/)===undefined){
                return []
            }
            return cmds.map(val=>new vscode.CompletionItem(val))
        }
    },'\\')
    const labelCompletion = vscode.languages.registerCompletionItemProvider('st', {
        provideCompletionItems(document,position) {
            if(document.getWordRangeAtPosition(position,/label:?[ ]*'/)===undefined){
                return []
            }
            const labels:Record<string,boolean>={}
            let max=0
            return Array.from(document.getText().matchAll(/label:?[ ]*'([^'\\\n]+)'/g)).filter(val=>{
                const label=val[1]
                if(labels[label]){
                    return false
                }
                const tmp=Number(label)
                if(isFinite(tmp)&&tmp>max){
                    max=tmp
                }
                return labels[label]=true
            }).map(val=>new vscode.CompletionItem(val[1],17)).concat(new vscode.CompletionItem((max+1).toString(),17))
        }
    },"'")
    const labelReference=vscode.languages.registerReferenceProvider('st',{
        provideReferences(document,position){
            const range=document.getWordRangeAtPosition(position,/label:?[ ]*'[^'\\\n]+'/)
            if(range===undefined){
                return []
            }
            const label=document.getText(range).replace(/^label:?[ ]*'/,'').slice(0,-1)
            return Array.from(document.getText().matchAll(/label:?[ ]*'([^'\\\n]+)'/g)).filter(val=>val[1]===label).map(val=>{
                const end=(val.index??0)+val[0].length-1
                const start=end-val[1].length
                return new vscode.Location(document.uri,new vscode.Range(document.positionAt(start),document.positionAt(end)))
            })
        }
    })
    const labelRename=vscode.languages.registerRenameProvider('st',{
        prepareRename(document,position){
            const range=document.getWordRangeAtPosition(position,/label:?[ ]*'[^'\\\n]+'/)
            if(range===undefined){
                return undefined
            }
            const label=document.getText(range).replace(/^label:?[ ]*'/,'').slice(0,-1)
            return new vscode.Range(new vscode.Position(range.end.line,range.end.character-label.length-1),new vscode.Position(range.end.line,range.end.character-1))
        },
        provideRenameEdits(document,position,newName){
            const edit=new vscode.WorkspaceEdit()
            const range=document.getWordRangeAtPosition(position,/label:?[ ]*'[^'\\\n]+'/)
            if(range===undefined){
                return edit
            }
            const label=document.getText(range).replace(/^label:?[ ]*'/,'').slice(0,-1)
            Array.from(document.getText().matchAll(/label:?[ ]*'([^'\\\n]+)'/g)).filter(val=>val[1]===label).forEach(val=>{
                const end=(val.index??0)+val[0].length-1
                const start=end-val[1].length
                edit.replace(document.uri,new vscode.Range(document.positionAt(start),document.positionAt(end)),newName)
            })
            return edit
        }
    })
    const format=vscode.languages.registerDocumentFormattingEditProvider('st',{
        provideDocumentFormattingEdits(document){
            const string=document.getText()
            const ston=parse('['+string+']')
            if(!Array.isArray(ston)){
                return []
            }
            return [vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0,0),document.positionAt(string.length)),ston.map(val=>stringify(val,'arrayInObject')).join('\n'))]
        }
    })
    const preview=vscode.commands.registerTextEditorCommand('stLang.preview',async(editor,edit)=>{
        if(
            editor.document.languageId!=='st'
            &&editor.document.languageId!=='urls'
            &&editor.document.languageId!=='markdown'
        ){
            return
        }
        let line=0
        if(editor.document.languageId==='st'){
            const ston=parse('['+editor.document.getText(new vscode.Range(new vscode.Position(0,0),editor.visibleRanges[0].start))+']')
            if(Array.isArray(ston)){
                for(let i=0;i<ston.length;i++){
                    const item=ston[i]
                    if(typeof item==='string'){
                        line+=item.split('\n').length
                    }else{
                        line++
                    }
                }
            }
        }
        const panel = vscode.window.createWebviewPanel(
            'stLang.preview',
            editor.document.uri.path.replace(/^.*\//,''),
            vscode.ViewColumn.Beside,
            {
                enableScripts:true
            }
        )
        const src=JSON.stringify(panel.webview.asWebviewUri(editor.document.uri).toString()+'?line='+line)
        panel.webview.html=`<!DOCTYPE html>
        <body style="background:black" data-color-scheme="dark"></body>
        <style>
            code{color:var(--color-text)}
        </style>
        <script src="https://ddu6.github.io/st/reader/main.js" data-src=${src}></script>`
    })
	context.subscriptions.push(backslash,labelCompletion,labelReference,labelRename,format,preview)
}
export function deactivate() {}