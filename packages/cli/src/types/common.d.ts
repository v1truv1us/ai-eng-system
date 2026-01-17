/**
 * Type-safe alternatives to 'any' for common patterns
 *
 * This module provides reusable type definitions and type guards to avoid
 * unnecessary use of 'any' while maintaining flexibility where needed.
 */
/**
 * JSON-compatible value type
 *
 * Represents any value that can be represented in JSON format.
 * This is safer than `any` as it still enforces JSON constraints.
 *
 * @example
 * ```ts
 * const data: JsonValue = { name: "test", count: 42, items: [] };
 * ```
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
/**
 * Record with unknown values
 *
 * Similar to `Record<string, any>` but forces type checking on usage.
 * Consumers must verify value types before accessing them.
 *
 * @example
 * ```ts
 * const data: UnknownRecord = { name: "test", count: 42 };
 * if (isRecord(data)) {
 *   const name = data.name; // Still unknown, must verify
 * }
 * ```
 */
export type UnknownRecord = Record<string, unknown>;
/**
 * Record for validated JSON data
 *
 * Use when you know the structure is valid JSON but don't know the exact schema.
 *
 * @example
 * ```ts
 * const parsed = JSON.parse(str) as JsonRecord;
 * ```
 */
export type JsonRecord = Record<string, JsonValue>;
/**
 * Type guard to check if a value is a record (object)
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 *
 * @example
 * ```ts
 * if (isRecord(data)) {
 *   const keys = Object.keys(data); // Safe to use Object methods
 * }
 * ```
 */
export declare function isRecord(value: unknown): value is UnknownRecord;
/**
 * Type guard to check if a value is a record with string values
 *
 * @param value - The value to check
 * @returns True if the value is an object with only string values
 *
 * @example
 * ```ts
 * if (isStringRecord(headers)) {
 *   const authHeader = headers["authorization"]; // Type is string
 * }
 * ```
 */
export declare function isStringRecord(value: unknown): value is Record<string, string>;
/**
 * Type guard to check if a value is a non-null object
 *
 * @param value - The value to check
 * @returns True if the value is a non-null object
 */
export declare function isObject(value: unknown): value is object;
/**
 * Safe property access with type narrowing
 *
 * Checks if an object has a specific property and narrows the type accordingly.
 *
 * @param obj - The object to check
 * @param key - The property key to check for
 * @returns True if the property exists
 *
 * @example
 * ```ts
 * const data: unknown = getInput();
 * if (hasProperty(data, "id")) {
 *   const id = data.id; // Type is unknown but we know it exists
 * }
 * ```
 */
export declare function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown>;
/**
 * Type guard to check if a value is an array
 *
 * @param value - The value to check
 * @returns True if the value is an array
 */
export declare function isArray(value: unknown): value is unknown[];
/**
 * Type guard to check if a value is a string
 *
 * @param value - The value to check
 * @returns True if the value is a string
 */
export declare function isString(value: unknown): value is string;
/**
 * Type guard to check if a value is a number
 *
 * @param value - The value to check
 * @returns True if the value is a number (and not NaN)
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Type guard to check if a value is a boolean
 *
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export declare function isBoolean(value: unknown): value is boolean;
/**
 * Get a property value from an unknown object with a default
 *
 * @param obj - The object to read from
 * @param key - The property key
 * @param defaultValue - The default value if property doesn't exist
 * @returns The property value or default
 *
 * @example
 * ```ts
 * const config: unknown = getConfig();
 * const timeout = getProperty(config, "timeout", 5000);
 * ```
 */
export declare function getProperty<T>(obj: unknown, key: string, defaultValue: T): T;
