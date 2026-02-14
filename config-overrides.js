const path = require('path');

module.exports = function override(config) {
  // Enable WebAssembly support
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
    syncWebAssembly: true,
    topLevelAwait: true,
  };

  // Find and modify the oneOf rules to properly handle .wasm files
  const oneOfRule = config.module.rules.find(rule => rule.oneOf);
  if (oneOfRule) {
    // Remove wasm from asset/resource handling
    oneOfRule.oneOf.forEach(rule => {
      if (rule.type === 'asset/resource') {
        if (!rule.exclude) {
          rule.exclude = [];
        }
        if (Array.isArray(rule.exclude)) {
          rule.exclude.push(/\.wasm$/);
        }
      }
      // Also exclude from file-loader if present
      if (rule.loader && rule.loader.includes('file-loader')) {
        if (!rule.exclude) {
          rule.exclude = [];
        }
        if (Array.isArray(rule.exclude)) {
          rule.exclude.push(/\.wasm$/);
        }
      }
    });

    // Add proper wasm rule at the beginning
    oneOfRule.oneOf.unshift({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
  }

  // Resolve configuration - use bundler version for webpack
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      fs: false,
      path: false,
      crypto: false,
    },
    alias: {
      ...config.resolve?.alias,
      // Use the bundler entry point which has proper wasm-bindgen JS glue code
      '@automerge/automerge$': path.resolve(
        __dirname,
        'node_modules/@automerge/automerge/dist/mjs/entrypoints/fullfat_bundler.js'
      ),
      // Also map the slim import to the main index (which works with bundler setup)
      '@automerge/automerge/slim$': path.resolve(
        __dirname,
        'node_modules/@automerge/automerge/dist/mjs/index.js'
      ),
    },
  };

  // Ignore source map warnings and critical dependency warnings
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Critical dependency/,
  ];

  // Output configuration for wasm
  config.output = {
    ...config.output,
    webassemblyModuleFilename: 'static/wasm/[modulehash].wasm',
  };

  return config;
};

