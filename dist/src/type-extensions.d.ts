import 'hardhat/types/config';
import 'hardhat/types/runtime';
import { FluentConfig, UserConfig } from './config/schema';
declare module 'hardhat/types/config' {
    interface HardhatUserConfig {
        fluent?: UserConfig;
    }
    interface HardhatConfig {
        fluent: FluentConfig;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map