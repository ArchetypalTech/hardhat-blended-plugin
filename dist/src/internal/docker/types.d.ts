export interface DockerRunOptions {
    image: string;
    command: string[];
    ports?: string[];
    volumes?: string[];
    env?: Record<string, string>;
    workdir?: string;
    network?: string;
}
//# sourceMappingURL=types.d.ts.map