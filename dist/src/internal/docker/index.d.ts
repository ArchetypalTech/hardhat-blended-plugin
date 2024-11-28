import { NodeSettings } from '../../config';
import { DockerRunOptions } from './types';
export declare class DockerManager {
    private config;
    private logger;
    constructor(config: NodeSettings);
    pullImage(): Promise<void>;
    run(options: DockerRunOptions): Promise<void>;
    private execCommand;
}
//# sourceMappingURL=index.d.ts.map