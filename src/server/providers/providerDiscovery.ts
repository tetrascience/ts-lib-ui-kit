/**
 * Provider Discovery Helpers
 *
 * Convenience functions for common provider discovery patterns in data apps.
 * These operate on the ProviderConfiguration[] returned by getProviderConfigurations()
 * and make it easy to populate dropdowns, find providers by name/type, and
 * list available providers without exposing secrets.
 */

import type { ProviderConfiguration, ProviderInfo } from "./types";

/**
 * Extract display-friendly provider information from full configurations.
 *
 * Returns a list of {@link ProviderInfo} objects containing name, type,
 * iconUrl, and the names of available connection fields — suitable for
 * populating UI dropdowns and selection lists without exposing secret values.
 *
 * @param configs - Array of provider configurations from getProviderConfigurations()
 * @returns Array of display-friendly provider info objects
 *
 * @example
 * ```typescript
 * const configs = await getProviderConfigurations(client);
 * const providerList = getProviderInfoList(configs);
 * // [{ name: "my-snowflake", type: "snowflake", iconUrl: "...", availableFields: ["user", "password", "account"] }, ...]
 * ```
 */
export function getProviderInfoList(
  configs: ProviderConfiguration[],
): ProviderInfo[] {
  return configs.map((config) => ({
    name: config.name,
    type: config.type,
    iconUrl: config.iconUrl ?? null,
    availableFields: Object.keys(config.fields),
  }));
}

/**
 * Find a provider configuration by name.
 *
 * @param configs - Array of provider configurations from getProviderConfigurations()
 * @param name - The provider name to search for (case-sensitive)
 * @returns The matching provider configuration, or undefined if not found
 *
 * @example
 * ```typescript
 * const configs = await getProviderConfigurations(client);
 * const snowflake = getProviderByName(configs, "my-snowflake-provider");
 * if (snowflake) {
 *   const provider = await buildProvider(snowflake);
 * }
 * ```
 */
export function getProviderByName(
  configs: ProviderConfiguration[],
  name: string,
): ProviderConfiguration | undefined {
  return configs.find((config) => config.name === name);
}

/**
 * Find all provider configurations of a given type.
 *
 * @param configs - Array of provider configurations from getProviderConfigurations()
 * @param type - The provider type to filter by (e.g., "snowflake", "databricks", "athena")
 * @returns Array of matching provider configurations (may be empty)
 *
 * @example
 * ```typescript
 * const configs = await getProviderConfigurations(client);
 * const snowflakeProviders = getProvidersByType(configs, "snowflake");
 * for (const config of snowflakeProviders) {
 *   console.log(`Found Snowflake provider: ${config.name}`);
 * }
 * ```
 */
export function getProvidersByType(
  configs: ProviderConfiguration[],
  type: string,
): ProviderConfiguration[] {
  return configs.filter((config) => config.type === type);
}

/**
 * Get the names of all attached providers.
 *
 * @param configs - Array of provider configurations from getProviderConfigurations()
 * @returns Array of provider names
 *
 * @example
 * ```typescript
 * const configs = await getProviderConfigurations(client);
 * const names = getProviderNames(configs);
 * // ["my-snowflake", "my-databricks", "my-athena"]
 * ```
 */
export function getProviderNames(configs: ProviderConfiguration[]): string[] {
  return configs.map((config) => config.name);
}

/**
 * Get the unique provider types available.
 *
 * @param configs - Array of provider configurations from getProviderConfigurations()
 * @returns Array of unique provider type strings
 *
 * @example
 * ```typescript
 * const configs = await getProviderConfigurations(client);
 * const types = getProviderTypes(configs);
 * // ["snowflake", "databricks"]
 * ```
 */
export function getProviderTypes(configs: ProviderConfiguration[]): string[] {
  return [...new Set(configs.map((config) => config.type))];
}

