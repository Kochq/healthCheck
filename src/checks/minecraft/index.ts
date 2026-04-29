import type { HealthCheckResult } from "../../types.js";
import type { MinecraftDetails } from "./types.js";
import { pingMinecraft } from "./protocol.js";

export async function checkMinecraft(): Promise<HealthCheckResult<MinecraftDetails>> {
    const start = Date.now();
    const MINECRAFT_PORT = process.env.MINECRAFT_PORT ? parseInt(process.env.MINECRAFT_PORT) : 25565;

    try {
        const res = await pingMinecraft("localhost", MINECRAFT_PORT);

        return {
            ok: true,
            service: "minecraft",
            latency_ms: Date.now() - start,
            details: {
                players: res.players?.online ?? 0,
                max_players: res.players?.max ?? 0,
                version: res.version?.name,
            }
        };
    } catch (err: unknown) {
        return {
            ok: false,
            service: "minecraft",
            latency_ms: Date.now() - start,
            error: err instanceof Error ? err.message : "unknown error"
        };
    }
}
