import * as vscode from 'vscode'
import {cmds} from './katex'
export function activate(context: vscode.ExtensionContext) {
	const backslash = vscode.languages.registerCompletionItemProvider('st', {
        provideCompletionItems(document, position) {
            return cmds.map(val=>new vscode.CompletionItem(val))
        }
    },'\\')
	context.subscriptions.push(backslash)
}
export function deactivate() {}