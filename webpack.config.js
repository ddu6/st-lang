module.exports = {
    entry: './out/extension.js',
    externals: {
        vscode: 'commonjs vscode'
    },
    mode: 'production',
    output: {
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        path: __dirname
    },
    target: 'webworker'
}