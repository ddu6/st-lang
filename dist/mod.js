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
const base_1 = require("@ddu6/stc/dist/base");
const vscode = require("vscode");
const katex_1 = require("./katex");
const extract_1 = require("./extract");
const stViewVersion = '0.31.5';
const css = `html:not([data-color-scheme=light])>body.vscode-dark {
    --color-text: rgb(204 204 204);
    --color-light: rgb(110 110 110);
    --color-border: rgb(43 43 43);
    --color-pre: rgb(24 24 24);
    --color-background: rgb(17 17 17);
    --color-warn: rgb(204 111 111);
    --color-string: rgb(204 162 111);
    --color-function: rgb(190 171 122);
    --color-number: rgb(111 157 111);
    --color-comment: rgb(129 186 129);
    --color-class: rgb(133 176 152);
    --color-modifier: rgb(122 163 204);
    --color-variable: rgb(111 181 204);
    --color-keyword: rgb(183 118 159);
    --color-slice: rgb(94 94 94 / .5);
    --color-selection: rgb(67 93 103 / .5);
    background-color: var(--color-background);
    color: var(--color-text);
}

html:not([data-color-scheme=light])>body.vscode-dark .invert {
    filter: brightness(calc(11 / 12)) invert(1) brightness(.8);
}

html:not([data-color-scheme=light])>body.vscode-dark .light {
    filter: brightness(calc(11 / 14)) invert(.325) brightness(calc(4 / 3));
}

html:not([data-color-scheme=light])>body.vscode-dark .dark {
    filter: brightness(.6875) invert(.1) brightness(calc(2 / 3));
}

body {
    color: inherit;
    font: inherit;
    padding: 0;
}

blockquote {
    background-color: transparent;
}

code,
a code {
    color: inherit;
}

img {
    max-height: none;
}

kbd,
.vscode-light kbd {
    background-color: transparent;
    border: 1px solid var(--color-border);
    box-shadow: none;
    color: inherit;
    vertical-align: baseline;
}`;
function createPreviewHTML(src, focusURL, focusPositionStr, focusId) {
    const params = [];
    if (focusURL !== undefined) {
        params.push(`data-focus-url=${JSON.stringify(focusURL)}`);
    }
    if (focusPositionStr !== undefined) {
        params.push(`data-focus-position=${JSON.stringify(focusPositionStr)}`);
    }
    if (focusId !== undefined) {
        params.push(`data-focus-id=${JSON.stringify(focusId)}`);
    }
    return `<!DOCTYPE html>
<html data-src=${JSON.stringify(`${src}?r=${Math.random()}`)} ${params.join(' ')}>

<head>
    <meta charset="utf-8">
    <style>
        ${css}
    </style>
</head>

<body>
    <script type="module">
        import "https://cdn.jsdelivr.net/gh/st-org/st-view@${stViewVersion}/main.js"
        const vscode = acquireVsCodeApi()
        window.viewer.dblClickLineListeners.push((...data) => {
            vscode.postMessage({
                type: 'reverse-focus',
                data
            })
        })
    </script>
</body>

</html>`;
}
function createPreview(uri, focusURL, focusPositionStr, focusId, context) {
    const panel = vscode.window.createWebviewPanel('st-lang.preview', uri.path.replace(/^.*\//, ''), vscode.ViewColumn.Beside, {
        enableScripts: true,
        enableFindWidget: true,
        enableCommandUris: true
    });
    const src = panel.webview.asWebviewUri(uri).toString();
    panel.webview.html = createPreviewHTML(src, focusURL, focusPositionStr, focusId);
    const t = vscode.workspace.onDidSaveTextDocument(document => {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined || editor.document !== document) {
            return;
        }
        let focusURL;
        let focusPositionStr;
        if (document.languageId === 'stdn') {
            focusURL = panel.webview.asWebviewUri(document.uri).toString();
            focusPositionStr = getCurrentPosition(editor).join(' ');
        }
        panel.webview.html = createPreviewHTML(src, focusURL, focusPositionStr, undefined);
    }, undefined, context.subscriptions);
    panel.onDidDispose(() => {
        t.dispose();
    }, undefined, context.subscriptions);
    panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
        if (message.type === 'reverse-focus') {
            const { authority, path } = vscode.Uri.parse(message.data[0].url);
            for (const editor of vscode.window.visibleTextEditors) {
                if (editor.document.languageId !== 'stdn') {
                    continue;
                }
                const uri = panel.webview.asWebviewUri(editor.document.uri);
                if (uri.authority !== authority || uri.path !== path) {
                    continue;
                }
                const result = stdn.parseWithIndex(editor.document.getText());
                if (result === undefined) {
                    return;
                }
                let { index } = result;
                const array = stdn.posiitonToUnitOrLinesWithIndex(message.data[2], result, -message.data[1]);
                if (array.length > 0) {
                    index = array[array.length - 1].index;
                }
                const position = editor.document.positionAt(index);
                editor.revealRange(new vscode.Range(position, position), 3);
            }
            return;
        }
    }), undefined, context.subscriptions);
}
function getCurrentPosition(editor) {
    const out = [];
    const currentIndex = editor.document.offsetAt(editor.visibleRanges[0].start);
    const result = stdn.parseWithIndex(editor.document.getText());
    if (result === undefined) {
        return out;
    }
    let stdnOrLine = result.value;
    while (true) {
        let next;
        let j = 0;
        for (let i = 0; i < stdnOrLine.length; i++) {
            const { value, index } = stdnOrLine[i];
            if (index > currentIndex) {
                break;
            }
            if (Array.isArray(value)) {
                next = value;
                j = i;
                continue;
            }
            if (typeof value === 'object') {
                next = value.children.value;
                j = i;
            }
        }
        if (next === undefined) {
            break;
        }
        stdnOrLine = next;
        out.push(j);
    }
    return out;
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
    const result = (0, extract_1.extractIds)(text);
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
function activate(context) {
    const backslash = vscode.languages.registerCompletionItemProvider('stdn', {
        provideCompletionItems(document, position) {
            if (document.getWordRangeAtPosition(position, /\\\\/) !== undefined) {
                return [];
            }
            return katex_1.cmds.map(value => new vscode.CompletionItem(value, 2));
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
                const contents = (0, extract_1.extractIds)(document.getText())
                    .filter(value => value.value === id)
                    .map(value => value.tag);
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    contents.push(...(0, extract_1.extractIds)(otherDocument.getText())
                        .filter(value => value.value === id)
                        .map(value => `${value.tag} ${uri.path}`));
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
                const out = (0, extract_1.extractIds)(document.getText())
                    .filter(value => value.type === 'id')
                    .map(value => new vscode.CompletionItem({
                    label: ston.stringify(value.value, { useUnquotedString: true }),
                    detail: value.tag
                }, 17));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIds)(otherDocument.getText())
                        .filter(value => value.type === 'id')
                        .map(value => new vscode.CompletionItem({
                        label: ston.stringify(value.value, { useUnquotedString: true }),
                        detail: value.tag,
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
                const out = (0, extract_1.extractIds)(document.getText())
                    .filter(value => value.type === 'id')
                    .map(value => new vscode.CompletionItem({
                    label: ston.stringify(`#${encodeURIComponent(value.value)}`, { useUnquotedString: true }),
                    detail: value.tag
                }, 17));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIds)(otherDocument.getText())
                        .filter(value => value.type === 'id')
                        .map(value => new vscode.CompletionItem({
                        label: ston.stringify(`#${encodeURIComponent(value.value)}`, { useUnquotedString: true }),
                        detail: value.tag,
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
                    'theorem'
                ].map(value => new vscode.CompletionItem({
                    label: value,
                }, 11))
                    .concat((0, extract_1.extractOrbits)(document.getText())
                    .map(value => new vscode.CompletionItem({
                    label: ston.stringify(value.value, { useUnquotedString: true }),
                    detail: value.tag
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
                    .filter(value => value.value === id)
                    .map(value => new vscode.Location(document.uri, getStringRange(document, value.index, value.originalString)));
                for (const uri of yield vscode.workspace.findFiles('**/*.{stdn,stdn.txt}')) {
                    const otherDocument = yield vscode.workspace.openTextDocument(uri);
                    if (otherDocument.languageId !== 'stdn' || otherDocument.uri === document.uri) {
                        continue;
                    }
                    out.push(...(0, extract_1.extractIds)(otherDocument.getText())
                        .filter(value => value.value === id)
                        .map(value => new vscode.Location(otherDocument.uri, getStringRange(otherDocument, value.index, value.originalString))));
                }
                return out;
            });
        }
    });
    const idRename = vscode.languages.registerRenameProvider('stdn', {
        prepareRename(document, position) {
            if (document.getWordRangeAtPosition(position, /(?:id|ref-id|href)[ ]*'.+'|(?:id|ref-id|href)[ ][^'{}\[\],]+/) === undefined) {
                throw new Error();
            }
            const { id, index, originalString } = getIdAtPosition(document, position);
            if (id.length === 0) {
                throw new Error();
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
                const idString = ston.stringify(newName, { useUnquotedString: true });
                const hrefString = ston.stringify(`#${encodeURIComponent(newName)}`, { useUnquotedString: true });
                idsWithIndex
                    .filter(value => value.value === id)
                    .forEach(value => {
                    edit.replace(document.uri, getStringRange(document, value.index, value.originalString), value.type === 'href' ? hrefString : idString);
                });
                return edit;
            });
        }
    });
    const formatSTDN = vscode.languages.registerDocumentFormattingEditProvider(['stdn', 'urls'], {
        provideDocumentFormattingEdits(document) {
            const string = document.getText();
            return [
                vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0, 0), document.positionAt(string.length)), stdn.format(string))
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
                vscode.TextEdit.replace(new vscode.Range(new vscode.Position(0, 0), document.positionAt(string.length)), ston.stringifyWithComment(result, {
                    addDecorativeSpace: 'always',
                    indentTarget: 'all',
                    useUnquotedString: true
                }))
            ];
        }
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
            string = (0, base_1.stdnToInlinePlainString)(result);
        }
        vscode.env.clipboard.writeText((0, base_1.stringToId)(string));
    });
    const copyStringifyResult = vscode.commands.registerTextEditorCommand('st-lang.copy-stringify-result', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston'
            || editor.selection.isEmpty) {
            return;
        }
        vscode.env.clipboard.writeText(editor.document.getText(editor.selection)
            .split('\n')
            .map(value => ston.stringify(value, { useUnquotedString: true }))
            .join('\n'));
    });
    const insertKatex = vscode.commands.registerTextEditorCommand('st-lang.insert-katex', (editor) => __awaiter(this, void 0, void 0, function* () {
        if (editor.document.languageId !== 'stdn') {
            return;
        }
        if (!(yield editor.edit(edit => {
            editor.selections.forEach(selection => edit.replace(selection, "'{''}'"));
        }))) {
            return;
        }
        editor.selections = editor.selections.map(selection => {
            const { start: { line, character } } = selection;
            const position = new vscode.Position(line, character + 3);
            return new vscode.Selection(position, position);
        });
    }));
    const jumpString = vscode.commands.registerTextEditorCommand('st-lang.jump-string', (editor) => __awaiter(this, void 0, void 0, function* () {
        if (editor.document.languageId !== 'stdn') {
            return;
        }
        const selections = [];
        const { length } = editor.document.getText();
        let lastIndex = 0;
        for (const selection of editor.selections) {
            const index = editor.document.offsetAt(selection.active);
            if (index < lastIndex - 1) {
                continue;
            }
            for (let i = index + 2; i <= length; i++) {
                const position = editor.document.positionAt(i);
                if (position.character === 0 || editor.document.getText(new vscode.Range(new vscode.Position(position.line, position.character - 1), position)) !== "'") {
                    continue;
                }
                selections.push(new vscode.Selection(position, position));
                lastIndex = i;
                break;
            }
        }
        if (selections.length > 0) {
            editor.selections = selections;
        }
    }));
    const preview = vscode.commands.registerTextEditorCommand('st-lang.preview', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls') {
            return;
        }
        let focusPositionStr;
        if (editor.document.languageId === 'stdn') {
            focusPositionStr = getCurrentPosition(editor).join(' ');
        }
        createPreview(editor.document.uri, undefined, focusPositionStr, undefined, context);
    });
    const previewPath = vscode.commands.registerCommand('st-lang.preview-path', (path, focusURL, focusPositionStr, focusId) => {
        createPreview(vscode.Uri.file(path), focusURL, focusPositionStr, focusId, context);
    });
    const quoteString = vscode.commands.registerTextEditorCommand('st-lang.quote-string', (editor, edit) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston') {
            return;
        }
        let lastRange;
        for (const selection of editor.selections) {
            const range = editor.document.getWordRangeAtPosition(selection.anchor, /[^\s',\[\]{}][^\n',\[\]{}]*/);
            if (range === undefined || lastRange !== undefined && range.isEqual(lastRange)) {
                continue;
            }
            lastRange = range;
            edit.insert(range.start, "'");
            edit.insert(range.end, "'");
        }
    });
    const selectString = vscode.commands.registerTextEditorCommand('st-lang.select-string', (editor) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston') {
            return;
        }
        const selections = [];
        for (const selection of editor.selections) {
            const range = editor.document.getWordRangeAtPosition(selection.anchor, /[^\s',\[\]{}][^\n',\[\]{}]*/);
            if (range === undefined) {
                continue;
            }
            selections.push(new vscode.Selection(range.start, range.end));
        }
        if (selections.length > 0) {
            editor.selections = selections;
        }
    });
    const stringify = vscode.commands.registerTextEditorCommand('st-lang.stringify', (editor, edit) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston') {
            return;
        }
        for (const selection of editor.selections) {
            if (selection.isEmpty) {
                continue;
            }
            edit.replace(selection, editor.document.getText(selection)
                .split('\n')
                .map(value => ston.stringify(value, { useUnquotedString: true }))
                .join('\n'));
        }
    });
    const unquoteString = vscode.commands.registerTextEditorCommand('st-lang.unquote-string', (editor, edit) => {
        if (editor.document.languageId !== 'stdn'
            && editor.document.languageId !== 'urls'
            && editor.document.languageId !== 'ston') {
            return;
        }
        let lastRange;
        for (const selection of editor.selections) {
            const range = editor.document.getWordRangeAtPosition(selection.anchor, /'[^\s',\[\]{}][^\n',\[\]{}]*'/);
            if (range === undefined || lastRange !== undefined && range.isEqual(lastRange)) {
                continue;
            }
            lastRange = range;
            const { start, end } = range;
            edit.delete(new vscode.Range(start, new vscode.Position(start.line, start.character + 1)));
            edit.delete(new vscode.Range(new vscode.Position(end.line, end.character - 1), end));
        }
    });
    context.subscriptions.push(backslash, idHover, ridCompletion, hrefCompletion, orbitCompletion, idReference, idRename, formatSTDN, formatSTON, copyId, copyStringifyResult, insertKatex, jumpString, preview, previewPath, quoteString, selectString, stringify, unquoteString);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
