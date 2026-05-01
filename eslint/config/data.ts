import jsonc from "eslint-plugin-jsonc";
import toml from "eslint-plugin-toml";
import yml from "eslint-plugin-yml";
import type { ConfigWithExtends } from "typescript-eslint";

import { configsAsErrors } from "./shared";

/**
 * Creates lint configs for structured data files such as JSON, YAML, and TOML.
 *
 * @returns Flat config blocks for repository data/config file formats.
 */
export function createDataConfigs(): readonly ConfigWithExtends[] {
  return [
    ...jsonc.configs["flat/recommended-with-jsonc"],
    ...yml.configs["flat/recommended"],
    ...configsAsErrors(toml.configs["flat/recommended"]),
  ];
}
