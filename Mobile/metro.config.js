const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');

const defaultConfig = getDefaultConfig(__dirname);

const config = {};

const finalConfig = mergeConfig(defaultConfig, config);

module.exports = withStorybook(finalConfig, {
  enabled: true,
  configPath: './.storybook',
});
