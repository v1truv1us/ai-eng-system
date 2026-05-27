/**
 * Driver factory — returns the correct Driver implementation for a runtime name.
 */

import type { Driver, DriverConfig, DriverName } from "./types.js";
import { DriverError } from "./types.js";

export type { Driver, DriverConfig, DriverName } from "./types.js";
export { DriverError } from "./types.js";

const DRIVER_MODULES: Record<
    DriverName,
    () => Promise<{ createDriver(config?: DriverConfig): Driver }>
> = {
    pi: () => import("./pi.js"),
    cursor: () => import("./cursor.js"),
    anthropic: () => import("./anthropic.js"),
    codex: () => import("./codex.js"),
    opencode: () => import("./opencode.js"),
};

/**
 * Create a Driver for the named runtime.
 *
 * @param name   Runtime name
 * @param config Optional driver configuration
 * @returns Driver instance
 */
export async function createDriver(
    name: DriverName,
    config?: DriverConfig,
): Promise<Driver> {
    const loader = DRIVER_MODULES[name];
    if (!loader) {
        throw new DriverError(`Unknown driver "${name}"`, "DRIVER_UNKNOWN");
    }
    const mod = await loader();
    return mod.createDriver(config);
}
