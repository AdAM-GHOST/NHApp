// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Polyfill for toReversed - MUST be before any config loading
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    const copy = [...this];
    copy.reverse();
    return copy;
  };
}

// Get default config
const config = getDefaultConfig(__dirname);

// Configure transformer
config.transformer.babelTransformerPath = path.resolve(__dirname, 'metro-css-transformer-wrapper.js');

// Configure resolver - remove iOS
config.resolver.sourceExts.push('css');
config.resolver.platforms = ['android', 'native', 'web'];

// Handle worklets for web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-worklets') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'worklets.web.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
