module.exports = {
    entry: './out/extension.js',
    externals: {
        vscode: 'commonjs vscode'
    },
    output: {
        path: __dirname,
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    target: 'webworker'
}