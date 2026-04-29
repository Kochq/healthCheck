export type MinecraftStatus = {
    version?: {
        name?: string;
        protocol?: number;
    };
    players?: {
        online?: number;
        max?: number;
    };
    description?: unknown;
};

export type MinecraftDetails = {
    players: number;
    max_players: number;
    version?: string;
};
