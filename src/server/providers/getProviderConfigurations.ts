/**
 * Get Provider Configurations
 *
 * TypeScript equivalent of get_provider_configurations from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 *
 * Retrieves data app provider configurations either from environment variable
 * override or by fetching from the TDP API.
 */

import { DataAppProviderClient } from "./DataAppProviderClient";
import { InvalidProviderConfigurationError } from "./exceptions";
import type {
  GetProviderConfigurationsOptions,
  ProviderConfiguration,
} from "./types";

// Re-export for backwards compatibility
export { InvalidProviderConfigurationError };

/**
 * Get the provider configurations.
 *
 * There are two ways to get the provider configurations:
 * 1. If the environment variable `DATA_APP_PROVIDER_CONFIG` is set or
 *    providerConfigOverride is provided, the provider configurations are read from it.
 * 2. If the environment variable `CONNECTOR_ID` is set or connectorId is provided,
 *    the provider configurations are fetched from TDP. The secrets are read from
 *    environment variables.
 * 3. If neither of the above is set, an empty array is returned.
 *
 * Option 1 is used for local development to specify the provider configurations directly.
 * Option 2 is used in production to fetch the provider configurations from TDP.
 *
 * @param client - DataAppProviderClient instance for TDP API calls
 * @param options - Optional configuration overrides
 * @returns Array of provider configurations
 * @throws {InvalidProviderConfigurationError} If provider config JSON is invalid
 *
 * @example
 * ```typescript
 * import { getProviderConfigurations, DataAppProviderClient } from '@tetrascience-npm/tetrascience-react-ui/server';
 *
 * const client = new DataAppProviderClient();
 * const providers = await getProviderConfigurations(client);
 *
 * for (const provider of providers) {
 *   console.log(`Provider: ${provider.name} (${provider.type})`);
 * }
 * ```
 */
export async function getProviderConfigurations(
  client: DataAppProviderClient,
  options: GetProviderConfigurationsOptions = {},
): Promise<ProviderConfiguration[]> {
  // Check for override from options or environment variable
  const configStr =
    options.providerConfigOverride || process.env.DATA_APP_PROVIDER_CONFIG;

  if (configStr) {
    try {
      const parsed = JSON.parse(configStr);

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        throw new InvalidProviderConfigurationError(
          "Invalid provider configuration: expected an array of provider configurations",
        );
      }

      // Validate each entry has required fields
      return parsed.map((item: unknown, index: number) => {
        if (typeof item !== "object" || item === null) {
          throw new InvalidProviderConfigurationError(
            `Invalid provider configuration at index ${index}: expected an object`,
          );
        }

        const obj = item as Record<string, unknown>;

        if (typeof obj.name !== "string") {
          throw new InvalidProviderConfigurationError(
            `Invalid provider configuration at index ${index}: 'name' must be a string`,
          );
        }
        if (typeof obj.type !== "string") {
          throw new InvalidProviderConfigurationError(
            `Invalid provider configuration at index ${index}: 'type' must be a string`,
          );
        }
        if (typeof obj.fields !== "object" || obj.fields === null) {
          throw new InvalidProviderConfigurationError(
            `Invalid provider configuration at index ${index}: 'fields' must be an object`,
          );
        }

        return {
          name: obj.name,
          type: obj.type,
          iconUrl: typeof obj.iconUrl === "string" ? obj.iconUrl : undefined,
          fields: obj.fields as Record<string, string | undefined>,
        } satisfies ProviderConfiguration;
      });
    } catch (e) {
      if (e instanceof InvalidProviderConfigurationError) {
        throw e;
      }
      throw new InvalidProviderConfigurationError(
        `Invalid provider configuration JSON in DATA_APP_PROVIDER_CONFIG: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Get connector ID from options or environment variable
  const connectorId = options.connectorId || process.env.CONNECTOR_ID;

  if (!connectorId) {
    console.warn(
      "Environment variable CONNECTOR_ID is not set. Unable to fetch providers.",
    );
    return [];
  }

  // Fetch container data app from TDP
  const containerApp = await client.getContainerDataApp(connectorId);

  // Get provider configurations with secrets from environment variables
  const providerConfigurations: ProviderConfiguration[] = [];

  for (const minimalProvider of containerApp.providers) {
    // Get full provider with secret names
    const provider = await client.getProvider(minimalProvider.id);

    // Build fields from environment variables
    const fields: Record<string, string | undefined> = {};
    for (const secret of provider.secrets) {
      const secretName = secret.envName;
      const secretValue = process.env[secret.envName];
      fields[secretName] = secretValue;
    }

    const config: ProviderConfiguration = {
      name: provider.name,
      type: provider.type,
      iconUrl: provider.iconUrl,
      fields,
    };

    providerConfigurations.push(config);
  }

  return providerConfigurations;
}

