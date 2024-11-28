export declare const DEFAULT_SETTINGS: {
    contracts: never[];
    compile: {
        target: string;
        debug: boolean;
        options: string[];
    };
    test: {
        command: string;
        options: string[];
        timeout: number;
        retries: number;
    };
    node: {
        docker: {
            image: string;
            tag: string;
            pull: "if-not-present";
        };
        network: {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        };
    };
    discovery: {
        enabled: boolean;
        paths: string[];
        ignore: string[];
    };
    env: {
        RUST_LOG: string;
    };
};
//# sourceMappingURL=defaults.d.ts.map