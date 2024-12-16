import { z } from 'zod';
declare const CompileSettingsSchema: z.ZodObject<{
    target: z.ZodString;
    debug: z.ZodBoolean;
    options: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    target: string;
    debug: boolean;
    options: string[];
}, {
    target: string;
    debug: boolean;
    options: string[];
}>;
declare const TestSettingsSchema: z.ZodObject<{
    command: z.ZodString;
    options: z.ZodArray<z.ZodString, "many">;
    timeout: z.ZodNumber;
    retries: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timeout: number;
    retries: number;
    options: string[];
    command: string;
}, {
    timeout: number;
    retries: number;
    options: string[];
    command: string;
}>;
declare const NodeSettingsSchema: z.ZodObject<{
    docker: z.ZodObject<{
        image: z.ZodString;
        tag: z.ZodString;
        pull: z.ZodEnum<["always", "if-not-present", "never"]>;
    }, "strip", z.ZodTypeAny, {
        image: string;
        tag: string;
        pull: "if-not-present" | "never" | "always";
    }, {
        image: string;
        tag: string;
        pull: "if-not-present" | "never" | "always";
    }>;
    network: z.ZodObject<{
        chain: z.ZodString;
        dataDir: z.ZodString;
        blockTime: z.ZodString;
        port: z.ZodNumber;
        httpPort: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chain: string;
        dataDir: string;
        blockTime: string;
        port: number;
        httpPort: number;
    }, {
        chain: string;
        dataDir: string;
        blockTime: string;
        port: number;
        httpPort: number;
    }>;
}, "strip", z.ZodTypeAny, {
    docker: {
        image: string;
        tag: string;
        pull: "if-not-present" | "never" | "always";
    };
    network: {
        chain: string;
        dataDir: string;
        blockTime: string;
        port: number;
        httpPort: number;
    };
}, {
    docker: {
        image: string;
        tag: string;
        pull: "if-not-present" | "never" | "always";
    };
    network: {
        chain: string;
        dataDir: string;
        blockTime: string;
        port: number;
        httpPort: number;
    };
}>;
declare const ContractConfigSchema: z.ZodObject<{
    path: z.ZodString;
    interface: z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>;
    compile: z.ZodObject<{
        target: z.ZodString;
        debug: z.ZodBoolean;
        options: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        target: string;
        debug: boolean;
        options: string[];
    }, {
        target: string;
        debug: boolean;
        options: string[];
    }>;
    test: z.ZodObject<{
        command: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        timeout: z.ZodNumber;
        retries: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    }, {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    }>;
}, "strip", z.ZodTypeAny, {
    test: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    };
    path: string;
    compile: {
        target: string;
        debug: boolean;
        options: string[];
    };
    interface: {
        path: string;
    };
}, {
    test: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    };
    path: string;
    compile: {
        target: string;
        debug: boolean;
        options: string[];
    };
    interface: {
        path: string;
    };
}>;
export declare const FluentConfigSchema: z.ZodPipeline<z.ZodEffects<z.ZodObject<{
    compile: z.ZodOptional<z.ZodObject<{
        target: z.ZodOptional<z.ZodString>;
        debug: z.ZodOptional<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    }, {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    }>>;
    test: z.ZodOptional<z.ZodObject<{
        command: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timeout: z.ZodOptional<z.ZodNumber>;
        retries: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    }, {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    }>>;
    node: z.ZodOptional<z.ZodObject<{
        docker: z.ZodOptional<z.ZodObject<{
            image: z.ZodOptional<z.ZodString>;
            tag: z.ZodOptional<z.ZodString>;
            pull: z.ZodOptional<z.ZodEnum<["always", "if-not-present", "never"]>>;
        }, "strip", z.ZodTypeAny, {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        }, {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        }>>;
        network: z.ZodOptional<z.ZodObject<{
            chain: z.ZodOptional<z.ZodString>;
            dataDir: z.ZodOptional<z.ZodString>;
            blockTime: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodNumber>;
            httpPort: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        }, {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    }, {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    }>>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    contracts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        interface: z.ZodObject<{
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
        }, {
            path: string;
        }>;
        compile: z.ZodOptional<z.ZodObject<{
            target: z.ZodOptional<z.ZodString>;
            debug: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        }, {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        }>>;
        test: z.ZodOptional<z.ZodObject<{
            command: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            timeout: z.ZodOptional<z.ZodNumber>;
            retries: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        }, {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        } | undefined;
        compile?: {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        } | undefined;
    }, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        } | undefined;
        compile?: {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        } | undefined;
    }>, "many">>;
    discovery: z.ZodOptional<z.ZodObject<{
        errorOnContractDiscovery: z.ZodBoolean;
        enabled: z.ZodBoolean;
        paths: z.ZodArray<z.ZodString, "many">;
        ignore: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    }, {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    }>>;
}, "strip", z.ZodTypeAny, {
    test?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        } | undefined;
        compile?: {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        } | undefined;
    }[] | undefined;
    compile?: {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    } | undefined;
    node?: {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    } | undefined;
}, {
    test?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        } | undefined;
        compile?: {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        } | undefined;
    }[] | undefined;
    compile?: {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    } | undefined;
    node?: {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    } | undefined;
}>, {
    env: {
        RUST_LOG: string;
    };
    contracts: {
        compile: {
            target: string;
            debug: boolean;
            options: string[];
        };
        test: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        };
        path: string;
        interface?: {
            path: string;
        };
    }[];
    test: {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    };
    compile: {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    };
    node: {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    };
    discovery: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    };
}, {
    test?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        options?: string[] | undefined;
        command?: string | undefined;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout?: number | undefined;
            retries?: number | undefined;
            options?: string[] | undefined;
            command?: string | undefined;
        } | undefined;
        compile?: {
            target?: string | undefined;
            debug?: boolean | undefined;
            options?: string[] | undefined;
        } | undefined;
    }[] | undefined;
    compile?: {
        target?: string | undefined;
        debug?: boolean | undefined;
        options?: string[] | undefined;
    } | undefined;
    node?: {
        docker?: {
            image?: string | undefined;
            tag?: string | undefined;
            pull?: "if-not-present" | "never" | "always" | undefined;
        } | undefined;
        network?: {
            chain?: string | undefined;
            dataDir?: string | undefined;
            blockTime?: string | undefined;
            port?: number | undefined;
            httpPort?: number | undefined;
        } | undefined;
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    } | undefined;
}>, z.ZodObject<{
    compile: z.ZodObject<{
        target: z.ZodString;
        debug: z.ZodBoolean;
        options: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        target: string;
        debug: boolean;
        options: string[];
    }, {
        target: string;
        debug: boolean;
        options: string[];
    }>;
    test: z.ZodObject<{
        command: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        timeout: z.ZodNumber;
        retries: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    }, {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    }>;
    node: z.ZodObject<{
        docker: z.ZodObject<{
            image: z.ZodString;
            tag: z.ZodString;
            pull: z.ZodEnum<["always", "if-not-present", "never"]>;
        }, "strip", z.ZodTypeAny, {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        }, {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        }>;
        network: z.ZodObject<{
            chain: z.ZodString;
            dataDir: z.ZodString;
            blockTime: z.ZodString;
            port: z.ZodNumber;
            httpPort: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        }, {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        docker: {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        };
        network: {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        };
    }, {
        docker: {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        };
        network: {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        };
    }>;
    env: z.ZodRecord<z.ZodString, z.ZodString>;
    discovery: z.ZodObject<{
        errorOnContractDiscovery: z.ZodBoolean;
        enabled: z.ZodBoolean;
        paths: z.ZodArray<z.ZodString, "many">;
        ignore: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    }, {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    }>;
    contracts: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        interface: z.ZodObject<{
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
        }, {
            path: string;
        }>;
        compile: z.ZodObject<{
            target: z.ZodString;
            debug: z.ZodBoolean;
            options: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            target: string;
            debug: boolean;
            options: string[];
        }, {
            target: string;
            debug: boolean;
            options: string[];
        }>;
        test: z.ZodObject<{
            command: z.ZodString;
            options: z.ZodArray<z.ZodString, "many">;
            timeout: z.ZodNumber;
            retries: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        }, {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        test: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        };
        path: string;
        compile: {
            target: string;
            debug: boolean;
            options: string[];
        };
        interface: {
            path: string;
        };
    }, {
        test: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        };
        path: string;
        compile: {
            target: string;
            debug: boolean;
            options: string[];
        };
        interface: {
            path: string;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    test: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    };
    contracts: {
        test: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        };
        path: string;
        compile: {
            target: string;
            debug: boolean;
            options: string[];
        };
        interface: {
            path: string;
        };
    }[];
    compile: {
        target: string;
        debug: boolean;
        options: string[];
    };
    node: {
        docker: {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        };
        network: {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        };
    };
    env: Record<string, string>;
    discovery: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    };
}, {
    test: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    };
    contracts: {
        test: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        };
        path: string;
        compile: {
            target: string;
            debug: boolean;
            options: string[];
        };
        interface: {
            path: string;
        };
    }[];
    compile: {
        target: string;
        debug: boolean;
        options: string[];
    };
    node: {
        docker: {
            image: string;
            tag: string;
            pull: "if-not-present" | "never" | "always";
        };
        network: {
            chain: string;
            dataDir: string;
            blockTime: string;
            port: number;
            httpPort: number;
        };
    };
    env: Record<string, string>;
    discovery: {
        errorOnContractDiscovery: boolean;
        enabled: boolean;
        paths: string[];
        ignore: string[];
    };
}>>;
export type UserConfig = z.input<typeof FluentConfigSchema>;
export type FluentConfig = z.output<typeof FluentConfigSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type CompileSettings = z.infer<typeof CompileSettingsSchema>;
export type TestSettings = z.infer<typeof TestSettingsSchema>;
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export {};
//# sourceMappingURL=schema.d.ts.map