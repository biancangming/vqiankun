import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import type { RollupOptions } from 'rollup'
import { readFileSync } from 'fs'
import path from 'path'



const configs: RollupOptions[] = []

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

const vue2input = 'package/vue2/index.ts'
const vue3input = 'package/vue3/index.ts'
const iifeName = "vqiankun"
function createOutputPath(prefix: 'vue2' | 'vue3', suffix: 'mjs' | 'cjs' | 'iife.js' | 'iife.min.js' | 'd.ts') {
    return `dist/${prefix}/index.${suffix}`
}

const iifeGlobals = {
    vqiankun: "vqiankun"
}


configs.push(
    {
        input: vue2input,
        output: [
            {
                file: createOutputPath('vue2', 'mjs'),
                format: 'es',
            },
            {
                file: createOutputPath('vue2', 'cjs'),
                format: 'cjs',
            },
            {
                file: createOutputPath('vue2', 'iife.js'),
                format: 'iife',
                name: iifeName,
                extend: true,
                globals: iifeGlobals,
            },
            {
                file: createOutputPath('vue2', 'iife.min.js'),
                format: 'iife',
                name: iifeName,
                extend: true,
                globals: iifeGlobals,
                plugins: [
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
        input: vue3input,
        output: {
            file: createOutputPath('vue2', 'd.ts'),
            format: 'es',
        },
        plugins: dtsPlugin,
        external: {
            ...externals
        }
    },
    {
        input: vue3input,
        output: [
            {
                file: createOutputPath('vue3', 'mjs'),
                format: 'es',
            },
            {
                file: createOutputPath('vue3', 'cjs'),
                format: 'cjs',
            },
            {
                file: createOutputPath('vue3', 'iife.js'),
                format: 'iife',
                name: iifeName,
                extend: true,
                globals: iifeGlobals,
            },
            {
                file: createOutputPath('vue3', 'iife.min.js'),
                format: 'iife',
                name: iifeName,
                extend: true,
                globals: iifeGlobals,
                plugins: [
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
        input: vue3input,
        output: {
            file: createOutputPath('vue3', 'd.ts'),
            format: 'es',
        },
        plugins: dtsPlugin,
        external: {
            ...externals
        }
    },
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