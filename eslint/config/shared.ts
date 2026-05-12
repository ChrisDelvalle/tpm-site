import type { ConfigWithExtends } from "typescript-eslint";

/** ESLint rule setting value accepted by flat config rule maps. */
export type RuleSetting = RuleSettings[string];

/** ESLint flat-config rule map used by local helper functions. */
export type RuleSettings = NonNullable<ConfigWithExtends["rules"]>;

/**
 * Narrows optional shared-config values before they are consumed.
 *
 * @param value Value that may be undefined.
 * @returns Whether the value is undefined.
 */
export const isUndefined = (value: unknown): value is undefined =>
  typeof value === "undefined";

/**
 * Converts every enabled rule in a shared config to an error-level rule.
 *
 * @param configs Shared flat config blocks to normalize.
 * @returns Config blocks with enabled rules promoted to errors.
 */
export function configsAsErrors(
  configs: readonly ConfigWithExtends[],
): readonly ConfigWithExtends[] {
  return configs.map((config) => ({
    ...config,
    rules: rulesAsErrors(config.rules),
  }));
}

/**
 * Returns a required plugin config or fails early with an actionable label.
 *
 * @template T - Shared config value type.
 * @param config Optional config exported by an ESLint plugin.
 * @param label Human-readable config label used in the thrown error.
 * @returns The required config value.
 */
export function requiredConfig<T>(config: T | undefined, label: string): T {
  if (isUndefined(config)) {
    throw new Error(`Missing ESLint shared config: ${label}.`);
  }

  return config;
}

/**
 * Converts a plugin rule map to local error-level enforcement.
 *
 * @param rules Rule map from a plugin or shared config.
 * @returns Rule map with enabled rules promoted to errors.
 */
export function rulesAsErrors(
  rules?: Readonly<Record<string, unknown>>,
): RuleSettings {
  return Object.fromEntries(
    Object.entries({ ...rules }).map(([name, setting]) => [
      name,
      ruleSettingAsError(setting),
    ]),
  );
}

/**
 * Converts an individual rule setting to error level while preserving off.
 *
 * @param setting Rule setting from a plugin or shared config.
 * @returns Equivalent local rule setting.
 */
export function ruleSettingAsError(setting: unknown): RuleSetting {
  if (setting === 0 || setting === "off") return setting;

  if (Array.isArray(setting)) {
    return ["error", ...setting.slice(1)] as RuleSetting;
  }

  return "error";
}
