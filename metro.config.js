// metro.config.js - Fixed for Node.js 18/20 compatibility
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// CRITICAL: Polyfill must be at the VERY TOP
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

// Also polyfill for any other missing methods
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

// Create default config
let config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

// Configure transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: path.resolve(__dirname, 'metro-css-transformer-wrapper.js'),
};

// Configure resolver (remove iOS)
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'css'],
  platforms: ['android', 'native', 'web'],
  extraNodeModules: {
    'react-native/Libraries/Utilities/codegenNativeCommands': require.resolve('./InternalBytecode.js'),
  },
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'react-native-worklets') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'worklets.web.js'),
      };
    }
    if (defaultResolveRequest) {
      try {
        return defaultResolveRequest(context, moduleName, platform);
      } catch (e) {
        // Fall through to default
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
