export type HealthCheckResult<TDetails = unknown> =
    | {
        ok: true;
        service: string;
        latency_ms: number;
        details?: TDetails;
    }
    | {
        ok: false;
        service: string;
        latency_ms: number;
        error: string;
    };
