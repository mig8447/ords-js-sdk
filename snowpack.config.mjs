import { createRequire } from 'module';
const require = createRequire( import.meta.url );
const packageJson = require( './package.json' );

process.env.SNOWPACK_PUBLIC_VERSION = packageJson.version;

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
    mount: {
        // get everything from src to build/
        src: '/',
        ...( process.env.NODE_ENV === 'development' ? {
            doc: {
                url: '/doc',
                static: true,
                resolve: false
            }
        } : {} )
    },
    exclude: [
        '**/node_modules/**/*',
        //...( process.env.NODE_ENV === 'production' ? [ '**/*.html' ] : [] )
    ],
    testOptions: {
        files: [
            '**/tests.html',
            '**/*.test.js'
        ]
    },
    plugins: [
        '@snowpack/plugin-dotenv'
    ],
    routes: [
        /* Enable an SPA Fallback in development: */
        // {"match": "routes", "src": ".*", "dest": "/index.html"},
    ],
    optimize: {
        /* Example: Bundle your final build: */
        entrypoints: [
            'index.js'
        ],
        bundle: true,
        sourcemap: false,
        threeshake: true,
        minify: true,
        target: 'es2018'
    },
    packageOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
    },
    buildOptions: {
        /* ... */
    },
};
