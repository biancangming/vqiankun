import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import type { RollupOptions, Plugin } from 'rollup'

const configs: RollupOptions[] = []

// const QIANKUN_IIFE = fs.readFileSync(require.resolve('qiankun/dist/index.umd.min.js'), 'utf-8')

// const injectQianKun: Plugin[] = [
//     {
//         name: 'inject-vue-demi',
//         renderChunk(code) {
//             return `${QIANKUN_IIFE};\n;${code}`
//         },
//     }
// ]

const externals = [
    'howtools',
    'vue',
    'vue-router',
    'qiankun'
]

const esbuildPlugin = esbuild()

const dtsPlugin = [
    dts(),
]

const esbuildMinifer = (options: ESBuildOptions) => {
    const { renderChunk } = esbuild(options)

    return {
        name: 'esbuild-minifer',
        renderChunk,
    }
}

const vue2Input = 'package/vue2/index.ts'
const vue3Input = 'package/vue3/index.ts'
const pluginInput = 'package/plugin/index.ts'

const iifeName = "vqiankun"
type prefixOption = 'vue2' | 'vue3' | 'plugin'
function createOutputPath(prefix: prefixOption, suffix: 'mjs' | 'cjs' | 'iife.js' | 'iife.min.js' | 'd.ts') {
    return `dist/${prefix}/index.${suffix}`
}

const iifeGlobals = {
    vqiankun: "vqiankun"
}

const baseConfig = (input: string, module: prefixOption): RollupOptions[] => {
    return [
        {
            input,
            output: [
                {
                    file: createOutputPath(module, 'mjs'),
                    format: 'es',
                },
                {
                    file: createOutputPath(module, 'cjs'),
                    format: 'cjs',
                },
                {
                    file: createOutputPath(module, 'iife.js'),
                    format: 'iife',
                    name: iifeName,
                    extend: true,
                    globals: iifeGlobals,
                },
                {
                    file: createOutputPath(module, 'iife.min.js'),
                    format: 'iife',
                    name: iifeName,
                    extend: true,
                    globals: iifeGlobals,
                    plugins: [
                        // injectQianKun,
                        esbuildMinifer({
                            minify: true,
                        }),
                    ],
                }
            ],
            plugins: [
                esbuildPlugin
            ],
        },
        {
            input: input,
            output: {
                file: createOutputPath(module, 'd.ts'),
                format: 'es',
            },
            plugins: dtsPlugin,
            external: {
                ...externals
            }
        },
    ]
}

configs.push(...baseConfig(vue2Input, 'vue2'))
configs.push(...baseConfig(vue3Input, 'vue3'))
configs.push(...baseConfig(pluginInput, 'plugin'))

configs.push(
    {
        input: 'package/public-path.ts',
        output: {
            file: 'dist/public-path.js',
            format: 'es',
        },
    },
    {
        input: 'package/public-path.ts',
        output: {
            file: 'dist/public-path.ts',
            format: 'es',
        },
    },
)

export default configs