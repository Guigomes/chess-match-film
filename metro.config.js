const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Allow Metro to bundle .onnx model files
    assetExts: [...defaultConfig.resolver.assetExts, 'onnx'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
