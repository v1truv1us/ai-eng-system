#!/usr/bin/env bun
import type { AiEngConfig } from "../config/schema";
import type { RalphFlags } from "./flags";
export declare function runCli(config: AiEngConfig, flags: RalphFlags): Promise<void>;
