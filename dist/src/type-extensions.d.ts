import 'hardhat/types/config';
import 'hardhat/types/runtime';
import { FluentConfig } from './config/schema';
declare module 'hardhat/types/config' {
    interface HardhatUserConfig {
        fluent?: FluentConfig;
    }
    interface HardhatConfig {
        fluent: FluentConfig;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map