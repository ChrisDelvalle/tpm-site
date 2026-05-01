type ConfigWithExtends = import("typescript-eslint").ConfigWithExtends;

type PluginWithConfigs = import("eslint").ESLint.Plugin & {
  readonly configs: Record<string, ConfigWithExtends>;
  readonly flatConfigs: Record<string, ConfigWithExtends>;
};

declare module "eslint-plugin-array-func" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-jsx-a11y" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-no-only-tests" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-no-unsanitized" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-no-use-extend-native" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-promise" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-react-perf" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-react-prefer-function-component" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-security" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-ssr-friendly" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-total-functions" {
  const plugin: PluginWithConfigs;
  export default plugin;
}

declare module "eslint-plugin-validate-jsx-nesting" {
  const plugin: PluginWithConfigs;
  export default plugin;
}
