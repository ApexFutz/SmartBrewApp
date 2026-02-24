const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add CSV file support to the asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, 'csv'];

module.exports = config;
