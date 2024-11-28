"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const schema_1 = require("./config/schema");
require("./type-extensions");
require("./tasks");
// Extend Hardhat's config with Fluent plugin configuration
(0, config_1.extendConfig)((config, userConfig) => {
    // Parse and validate config using Zod schema
    const fluentConfig = schema_1.FluentConfigSchema.parse(userConfig.fluent || {});
    // Assign the parsed and validated configuration
    config.fluent = fluentConfig;
});
// Re-export configuration types and utilities
__exportStar(require("./config"), exports);
//# sourceMappingURL=index.js.map