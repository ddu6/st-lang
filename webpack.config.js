module.exports = {
    entry: './dist/mod.js',
    externals: {
        vscode: 'commonjs vscode'
    },
    mode: 'production',
    output: {
        filename: 'mod.js',
        library: {
            type: 'commonjs2'
        },
        path: __dirname
    },
    target: 'webworker'
}