import net from "net";
import type { MinecraftStatus } from "./types.js";

function writeVarInt(value: number): Buffer {
    const bytes: number[] = [];

    do {
        let temp = value & 0x7f;
        value >>>= 7;
        if (value !== 0) temp |= 0x80;
        bytes.push(temp);
    } while (value !== 0);

    return Buffer.from(bytes);
}

function writeString(str: string): Buffer {
    const buf = Buffer.from(str, "utf8");
    return Buffer.concat([writeVarInt(buf.length), buf]);
}

export function pingMinecraft(
    host: string,
    port = 25565,
    timeout = 3000
): Promise<MinecraftStatus> {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });

        socket.setTimeout(timeout);

        socket.on("connect", () => {
            const handshake = Buffer.concat([
                writeVarInt(0x00),
                writeVarInt(758),
                writeString(host),
                Buffer.from([port >> 8, port & 0xff]),
                writeVarInt(1)
            ]);

            socket.write(Buffer.concat([
                writeVarInt(handshake.length),
                handshake
            ]));

            socket.write(Buffer.from([0x01, 0x00]));
        });

        let buffer: Buffer = Buffer.alloc(0);

        socket.on("data", (chunk: Buffer) => {
            buffer = Buffer.concat([buffer, chunk]);

            try {
                let offset = 0;

                function readVarInt(): number {
                    let num = 0;
                    let shift = 0;
                    let byte: number;

                    do {
                        if (offset >= buffer.length) throw new Error("incomplete");
                        byte = buffer[offset++];
                        num |= (byte & 0x7f) << shift;
                        shift += 7;
                    } while (byte & 0x80);

                    return num;
                }

                readVarInt(); // packet length
                readVarInt(); // packet id

                const strLen = readVarInt();
                if (offset + strLen > buffer.length) throw new Error("incomplete");

                const jsonStr = buffer
                    .slice(offset, offset + strLen)
                    .toString("utf8");

                const json: unknown = JSON.parse(jsonStr);

                socket.end();
                resolve(json as MinecraftStatus);
            } catch {
                // wait for more data
            }
        });

        socket.on("timeout", () => {
            socket.destroy();
            reject(new Error("timeout"));
        });

        socket.on("error", (err: Error) => {
            reject(err);
        });
    });
}
