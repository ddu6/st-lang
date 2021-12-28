"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const ston = require("ston");
const stdn = require("stdn");
const vscode = require("vscode");
const katex_1 = require("./katex");
const extract_1 = require("./extract");
const stViewVersion = '0.15.1';
const stylePatch = `html:not([data-color-scheme=light])>body.vscode-dark {
    --color-text: #cccccc;
    --color-light: #8f8f8f;
    --color-string: #df9e61;
    --color-number: #B5CEA8;
    --color-keyword: #cc80c6;
    --color-function: #DCDCAA;
    --color-variable: #6ec0ec;
    --color-modifier: #3074ac;
    --color-class: #4EC9B0;
    --color-warn: #F44747;
    --color-comment: #6A9955;
    --color-border: #2e3133;
    --color-bg: #131313;
    --color-area: #161616;
    --color-pre: #191b1d;
    --color-slice: rgba(88, 88, 88, .5);
    --color-selection: rgba(95, 144, 163, .5);
    --color-span: rgba(58, 61, 65, .5);
    background-color: var(--color-bg);
    color: var(--color-text);
}

html:not([data-color-scheme=light])>body.vscode-dark .dark {
    filter: brightness(.5);
}

html:not([data-color-scheme=light])>body.vscode-dark .invert {
    filter: invert(.9147982) brightness(.8745098);
}

body {
    color: inherit;
    font: inherit;
    padding: 0;
}

a:focus {
    outline: none;
}

blockquote {
    background-color: transparent;
}

code {
    color: inherit;
}

kbd {
    background-color: transparent;
    box-shadow: none;
    color: inherit;
    vertical-align: baseline;
}`;
function createPreviewHTML(src, focusURL, focusLine, focusId) {
    return `<!DOCTYPE html>
    <html style="background:black" data-src=${JSON.stringify(src + '?r=' + Math.random())} data-focus-url=${JSON.stringify(focusURL)} data-focus-line=${focusLine} data-focus-id=${JSON.stringify(focusId)}>
        <head>
            <style>
                ${stylePatch}
            </style>
        </head>
        <body>
            <script type="module" src="https://cdn.jsdelivr.net/gh/st-org/st-view@${stViewVersion}/main.js"></script>
            <script type="module">
                const vscode = acquireVsCodeApi()
                window.viewer.dblClickLineListeners.push((line,url,partialLine)=>{
                    vscode.postMessage({
                        type:'reverse-focus',
                        line,
                        url,
                        partialLine,
                    })
                })
            </script>
        </body>
    </html>`;
}
function createPreview(uri, focusURL, focusLine, focusId, context) {
    const panel = vscode.window.createWebviewPanel('st-lang.preview', uri.path.replace(/^.*\//, ''), vscode.ViewColumn.Beside, {
        enableScripts: true,
        enableFindWidget: true,
        enableCommandUris: true,
    });
    const src = panel.webview.asWebviewUri(uri).toString();
    panel.webview.html = createPreviewHTML(src, focusURL, focusLine, focusId);
    const t = vscode.workspace.onDidSaveTextDocument(document => {
        let focusURL = '';
        let focusLine = 0;
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined || editor.document !== document) {
            return;
        }
        if (document.languageId === 'stdn') {
            focusURL = panel.webview.asWebviewUri(document.uri).toString();
            focusLine = getCurrentLine(editor);
        }
        panel.webview.html = createPreviewHTML(src, focusURL, focusLine, '');
    }, undefined, context.subscriptions);
    panel.onDidDispose(() => {
        t.dispose();
    }, undefined, context.subscriptions);
    panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
        if (message.type === 'reverse-focus') {
            const uri0 = vscode.Uri.parse(message.url);
            for (const editor of vscode.window.visibleTextEditors) {
                if (editor.document.languageId !== 'stdn') {
                    continue;
                }
                const uri1 = panel.webview.asWebviewUri(editor.document.uri);
                if (uri1.authority !== uri0.authority || uri1.path !== uri0.path) {
                    continue;
                }
                const result = ston.parseWithIndex('[' + editor.document.getText() + ']', -1);
                if (result === undefined
                    || !Array.isArray(result.value)) {
                    return;
                }
                let lineCount = 0;
                for (const { value, index } of result.value) {
                    if (typeof value === 'object' || typeof value === 'string') {
                        lineCount++;
                    }
                    if (lineCount <= message.partialLine) {
                        continue;
                    }
                    const position = editor.document.positionAt(index);
                    editor.revealRange(new vscode.Range(position, position), 3);
                    return;
                }
            }
            return;
        }
    }), undefined, context.subscriptions);
}
function getCurrentLine(editor) {
    const result = stdn.parse(editor.document.getText(new vscode.Range(new vscode.Position(0, 0), editor.visibleRanges[0].start)));
    if (result === undefined) {
        return 0;
    }
    return Math.max(0, result.length);
}
function getStringRange(document, index, string) {
    const start = document.positionAt(index);
    let range = new vscode.Range(start, document.positionAt(index + 1));
    if (document.getText(range) !== "'") {
        return new vscode.Range(start, document.positionAt(index + string.length));
    }
    const max = 2 * string.length + 2 + index;
    for (let i = index + 1; i < max; i++) {
        const char = document.getText(new vscode.Range(document.positionAt(i), document.positionAt(i + 1)));
        if (char !== "'") {
            continue;
        }
        range = new vscode.Range(start, document.positionAt(i + 1));
        const string = document.getText(range);
        if (ston.parse(string) === string) {
            break;
        }
    }
    return range;
}
function getIdAtPosition(document, position) {
    const text = document.getText();
    const result = (0, extract_1.extractIdsWithIndex)(text);
    let id = '';
    let index = 0;
    let type = 'id';
    let originalString = '';
    for (const item of result) {
        const idPosition = document.positionAt(item.index);
        if (idPosition.line > position.line
            || idPosition.line < position.line) {
            continue;
        }
        if (idPosition.character > position.character) {
            break;
        }
        id = item.value;
        index = item.index;
        type = item.type;
        originalString = item.originalString;
    }
    return {
        id,
        index,
        type,
        originalString,
        idsWithIndex: result
    };
}
function stdnToInlinePlainString(stdn) {
    for (const line of stdn) {
        let string = '';
        for (const inline of line) {
            if (typeof inline === 'string') {
                string += inline;
                continue;
            }
            string += stdnToInlinePlainString(inline.children);
        }
        if (string.length > 0) {
            return string;
        }
    }
    return '';
}
function stringToId(string) {
    return Array.from(string.slice(0, 100).matchAll(/[a-zA-Z0-9]+/g)).join('-').toLowerCase();
}
function activate(context) {
    const backslash = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document, position) {
            if (document.getWordRangeAtPosition(position, /\\[a-zA-Z]*/) === undefined) {
                return [];
            }
            return katex_1.cmds.map(val => new vscode.CompletionItem(val, 2));
        }
    }, '\\');
    const idHover = vscode.languages.registerHoverProvider('stdn', {
        provideHover(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.getWordRangeAtPosition(position, /(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/) === undefined) {
                    return undefined;
                }
                const { id, index, originalString } = getIdAtPosition(document, position);
                if (id.length === 0) {
                    return undefined;
                }
                const contents = (0, extract_1.extractIdsWithTag)(document.getText())
                    .filter(val => val.value === id)
                    .map(val => val.tag);
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    contents.push(...(0, extract_1.extractIdsWithTag)(otherDocument.getText())
                        .filter(val => val.value === id)
                        .map(val => `${val.tag} ${uri.path}`));
                }
                return new vscode.Hover(contents, getStringRange(document, index, originalString));
            });
        }
    });
    const ridCompletion = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.getWordRangeAtPosition(position, /ref-id[ ]/) === undefined) {
                    return [];
                }
                const out = (0, extract_1.extractIdsWithTag)(document.getText())
                    .filter(val => val.type === 'id')
                    .map(val => new vscode.CompletionItem({
                    label: ston.stringify(val.value, { useUnquotedString: true }),
                    detail: val.tag
                }, 17));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIdsWithTag)(otherDocument.getText())
                        .filter(val => val.type === 'id')
                        .map(val => new vscode.CompletionItem({
                        label: ston.stringify(val.value, { useUnquotedString: true }),
                        detail: val.tag,
                        description: uri.path
                    }, 17)));
                }
                return out;
            });
        }
    }, " ");
    const hrefCompletion = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.getWordRangeAtPosition(position, /href[ ]/) === undefined) {
                    return [];
                }
                const out = (0, extract_1.extractIdsWithTag)(document.getText())
                    .filter(val => val.type === 'id')
                    .map(val => new vscode.CompletionItem({
                    label: ston.stringify('#' + encodeURIComponent(val.value), { useUnquotedString: true }),
                    detail: val.tag
                }, 17));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIdsWithTag)(otherDocument.getText())
                        .filter(val => val.type === 'id')
                        .map(val => new vscode.CompletionItem({
                        label: ston.stringify('#' + encodeURIComponent(val.value), { useUnquotedString: true }),
                        detail: val.tag,
                        description: uri.path
                    }, 17)));
                }
                return out;
            });
        }
    }, " ");
    const orbitCompletion = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.getWordRangeAtPosition(position, /orbit[ ]/) === undefined) {
                    return [];
                }
                const out = [
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
                ].map(val => new vscode.CompletionItem({
                    label: val,
                }, 11))
                    .concat((0, extract_1.extractOrbitsWithTag)(document.getText())
                    .map(val => new vscode.CompletionItem({
                    label: ston.stringify(val.value, { useUnquotedString: true }),
                    detail: val.tag
                }, 11)));
                return out;
            });
        }
    }, " ");
    const idReference = vscode.languages.registerReferenceProvider('stdn', {
        provideReferences(document, position) {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.getWordRangeAtPosition(position, /(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/) === undefined) {
                    return [];
                }
                const { id, idsWithIndex } = getIdAtPosition(document, position);
                if (id.length === 0) {
                    return [];
                }
                const out = idsWithIndex
                    .filter(val => val.value === id)
                    .map(val => new vscode.Location(document.uri, getStringRange(document, val.index, val.originalString)));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIdsWithIndex)(otherDocument.getText())
                        .filter(val => val.value === id)
                        .map(val => new vscode.Location(otherDocument.uri, getStringRange(otherDocument, val.index, val.originalString))));
                }
                return out;
            });
        }
    });
    const idRename = vscode.languages.registerRenameProvider('stdn', {
        prepareRename(document, position) {
            if (document.getWordRangeAtPosition(position, /(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/) === undefined) {
                return undefined;
            }
            const { id, index, originalString } = getIdAtPosition(document, position);
            if (id.length === 0) {
                return undefined;
            }
            return {
                range: getStringRange(document, index, originalString),
                placeholder: id
            };
        },
        provideRenameEdits(document, position, newName) {
            return __awaiter(this, void 0, void 0, function* () {
                const edit = new vscode.WorkspaceEdit();
                if (document.getWordRangeAtPosition(position, /(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/) === undefined) {
                    return edit;
                }
                const { id, idsWithIndex } = getIdAtPosition(document, position);
                if (id.length === 0) {
                    return edit;
                }
                const idStr = ston.stringify(newName, { useUnquotedString: true });
                const hrefStr = ston.stringify('#' + encodeURIComponent(newName), { useUnquotedString: true });
                idsWithIndex
                    .filter(val => val.value === id)
                    .forEach(val => {
                    edit.replace(document.uri, getStringRange(document, val.index, val.originalString), val.type === 'href' ? hrefStr : idStr);
                });
                return edit;
            });
        }
    });
    const formatSTDN = vscode.languages.registerDocumentFormattingEditProvider('stdn', {
        provideDocumentFormattingEdits(document) {
            const string = document.getText();
            return [
                vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0, 0), document.positionAt(string.length)), stdn.format(string))
            ];
        }
    });
    const formatURLs = vscode.languages.registerDocumentFormattingEditProvider('urls', {
        provideDocumentFormattingEdits(document) {
            const string = document.getText();
            const result = ston.parseWithIndex('[' + string + ']');
            if (result === undefined) {
                return [];
            }
            return [
                vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0, 0), document.positionAt(string.length)), ston.stringifyWithComment(result.value, {
                    indentLevel: -1,
                    indentTarget: 'all',
                    useUnquotedString: true,
                }).slice(2, -2))
            ];
        }
    });
    const formatSTON = vscode.languages.registerDocumentFormattingEditProvider('ston', {
        provideDocumentFormattingEdits(document) {
            const string = document.getText();
            const result = ston.parseWithIndex(string);
            if (result === undefined) {
                return [];
            }
            return [
                vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0, 0), document.positionAt(string.length)), ston.stringifyWithComment(result.value, {
                    indentTarget: 'all',
                    addDecorativeSpace: 'always',
                    useUnquotedString: true,
                }))
            ];
        }
    });
    const preview = vscode.commands.registerTextEditorCommand('st-lang.preview', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls') {
            return;
        }
        let focusLine = 0;
        if (editor.document.languageId === 'stdn') {
            focusLine = getCurrentLine(editor);
        }
        createPreview(editor.document.uri, '', focusLine, '', context);
    });
    const previewPath = vscode.commands.registerCommand('st-lang.preview-path', (path, focusURL = '', focusLine = 0, focusId = '') => {
        createPreview(vscode.Uri.file(path), focusURL, focusLine, focusId, context);
    });
    const stringify = vscode.commands.registerTextEditorCommand('st-lang.stringify', (editor, edit) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston'
            || editor.selection.isEmpty) {
            return;
        }
        edit.replace(editor.selection, editor.document.getText(editor.selection)
            .split('\n').map(val => ston.stringify(val, { useUnquotedString: true })).join('\n'));
    });
    const copyStringifyResult = vscode.commands.registerTextEditorCommand('st-lang.copy-stringify-result', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston'
            || editor.selection.isEmpty) {
            return;
        }
        vscode.env.clipboard.writeText(editor.document.getText(editor.selection)
            .split('\n').map(val => ston.stringify(val, { useUnquotedString: true })).join('\n'));
    });
    const copyId = vscode.commands.registerTextEditorCommand('st-lang.copy-id', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston'
            || editor.selection.isEmpty) {
            return;
        }
        let string = editor.document.getText(editor.selection);
        const result = stdn.parse(string);
        if (result !== undefined) {
            string = stdnToInlinePlainString(result);
        }
        vscode.env.clipboard.writeText(stringToId(string));
    });
    context.subscriptions.push(backslash, idHover, ridCompletion, hrefCompletion, orbitCompletion, idReference, idRename, formatSTDN, formatURLs, formatSTON, preview, previewPath, stringify, copyStringifyResult, copyId);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
