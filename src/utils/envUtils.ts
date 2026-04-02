type Parser<T> = (value: string) => T;

interface EnvOptions<T> {
  /**
   * Default value to return if the environment variable is not set.
   * If not provided, the function will throw an error when the variable is missing.
   */
  fallback?: T;
  /**
   * Function to parse the string value into a specific type.
   */
  parse?: Parser<T>;
}

/**
 * Retrieves an environment variable, optionally parsed and with a fallback.
 * Throws an error if the variable is missing and no fallback is provided.
 *
 * @param key The environment variable key (e.g., VITE_API_URL)
 * @param options Fallback and parsing options
 * @returns The (parsed) environment variable value or fallback
 */
export function getEnv(key: string): string;
export function getEnv<T = string>(key: string, options: EnvOptions<T>): T;
export function getEnv<T = string>(
  key: string,
  options?: EnvOptions<T>,
): T | string {
  const value = import.meta.env[key];

  // Missing value handling
  if (value === undefined || value === "") {
    if (options?.fallback !== undefined) {
      return options.fallback;
    }
    throw new Error(`Environment variable "${key}" is missing or empty.`);
  }

  // Parsing handling
  if (options?.parse) {
    try {
      return options.parse(value);
    } catch (error) {
      throw new Error(
        `Failed to parse environment variable "${key}". Value was "${value}". ${error}`,
      );
    }
  }

  return value;
}

// Provided common parsers for convenience
export const envParsers = {
  number: (val: string): number => {
    const parsed = Number(val);
    if (Number.isNaN(parsed)) throw new Error("Not a valid number");
    return parsed;
  },
  boolean: (val: string): boolean => {
    const lowerVal = val.toLowerCase();
    if (lowerVal === "true" || lowerVal === "1") return true;
    if (lowerVal === "false" || lowerVal === "0") return false;
    throw new Error("Not a valid boolean");
  },
  json: <T>(val: string): T => JSON.parse(val),
};
