const path = require("path")

module.exports  = {
    entry: ["./src/index.js"],
    resolve: {
        extensions: ['.js']
    },
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, "dist"),
        
    }
}