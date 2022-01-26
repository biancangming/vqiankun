import path from "path";

interface QiankunDevOption {
    allowOrigin: string;//跨域规则
}

class VQianKunWebpackPlugin {
    options: QiankunDevOption;

    constructor(options?: QiankunDevOption) {
        this.options = options || { allowOrigin: "*" }
    }

    apply(compiler) {
        compiler.hooks.afterPlugins.tap(
            "VQianKunWebpackPlugin",
            (compilation) => {
                const appName = require(path.resolve(process.cwd(), 'package.json')).name
                if (!compiler.options.devServer) compiler.options.devServer = {}
                if (!compiler.options.devServer.headers) compiler.options.devServer.headers = {}

                console.log(compiler.options.devServer.headers)

                Object.assign(compiler.options.output, {
                    libraryTarget: 'umd',
                    library: `${appName}-[name]`,
                    jsonpFunction: `webpackJsonp_${appName}`
                })


                Object.assign(compiler.options.devServer.headers, {
                    "Access-Control-Allow-Origin": this.options.allowOrigin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
                })

            }
        );
    }
}

export { VQianKunWebpackPlugin };
