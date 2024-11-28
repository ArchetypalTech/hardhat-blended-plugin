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
declare const UserContractConfigSchema: z.ZodObject<{
    path: z.ZodString;
    interface: z.ZodObject<{
        path: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        path: string;
    }, {
        path: string;
    }>;
    compile: z.ZodOptional<z.ZodObject<{
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
    }>>;
    test: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    interface: {
        path: string;
    };
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
}, {
    path: string;
    interface: {
        path: string;
    };
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
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
declare const UserConfigSchema: z.ZodObject<{
    compile: z.ZodOptional<z.ZodObject<{
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
    }>>;
    test: z.ZodOptional<z.ZodObject<{
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
    }>>;
    node: z.ZodOptional<z.ZodObject<{
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
        }>>;
        test: z.ZodOptional<z.ZodObject<{
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
        }>>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }>, "many">>;
    discovery: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        paths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        ignore: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    }, {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }[] | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
    node?: {
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
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    } | undefined;
}, {
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }[] | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
    node?: {
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
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    } | undefined;
}>;
export declare const FluentConfigSchema: z.ZodEffects<z.ZodObject<{
    compile: z.ZodOptional<z.ZodObject<{
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
    }>>;
    test: z.ZodOptional<z.ZodObject<{
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
    }>>;
    node: z.ZodOptional<z.ZodObject<{
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
        }>>;
        test: z.ZodOptional<z.ZodObject<{
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
        }>>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }, {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }>, "many">>;
    discovery: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        paths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        ignore: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    }, {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }[] | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
    node?: {
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
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    } | undefined;
}, {
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }[] | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
    node?: {
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
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    } | undefined;
}>, {
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
        interface: {
            path: string;
        };
    }[];
    env: Record<string, string>;
    discovery: {
        enabled: boolean;
        paths: string[];
        ignore: string[];
    };
    test: {
        command: string;
        options: string[];
        timeout: number;
        retries: number;
    };
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
}, {
    test?: {
        timeout: number;
        retries: number;
        options: string[];
        command: string;
    } | undefined;
    contracts?: {
        path: string;
        interface: {
            path: string;
        };
        test?: {
            timeout: number;
            retries: number;
            options: string[];
            command: string;
        } | undefined;
        compile?: {
            target: string;
            debug: boolean;
            options: string[];
        } | undefined;
    }[] | undefined;
    compile?: {
        target: string;
        debug: boolean;
        options: string[];
    } | undefined;
    node?: {
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
    } | undefined;
    env?: Record<string, string> | undefined;
    discovery?: {
        enabled?: boolean | undefined;
        paths?: string[] | undefined;
        ignore?: string[] | undefined;
    } | undefined;
}>;
export type UserConfig = z.infer<typeof UserConfigSchema>;
export type UserContractConfig = z.infer<typeof UserContractConfigSchema>;
export type CompileSettings = z.infer<typeof CompileSettingsSchema>;
export type TestSettings = z.infer<typeof TestSettingsSchema>;
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type FluentConfig = z.output<typeof FluentConfigSchema>;
export {};
//# sourceMappingURL=schema.d.ts.map