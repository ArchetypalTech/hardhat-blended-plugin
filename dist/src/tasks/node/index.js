"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const docker_1 = require("../../internal/docker");
const logger_1 = require("../../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const errors_1 = require("../../config/errors");
const TASK_RUN_LOCAL_NODE = 'node:fluent';
const logger = new logger_1.Logger({ showTimestamp: true });
(0, config_1.task)(TASK_RUN_LOCAL_NODE, 'Runs a Fluent node in a Docker container').setAction(async (_, hre) => {
    const nodeConfig = hre.config.fluent.node;
    const docker = new docker_1.DockerManager(nodeConfig);
    try {
        const dataDir = path_1.default.resolve(process.cwd(), nodeConfig.network.dataDir);
        (0, fs_extra_1.ensureDirSync)(dataDir);
        const imageWithTag = `${nodeConfig.docker.image}:${nodeConfig.docker.tag}`;
        const command = [
            '--chain',
            nodeConfig.network.chain,
            'node',
            '--datadir',
            '/data',
            '--dev',
            '--dev.block-time',
            nodeConfig.network.blockTime,
            '--full',
            '--http',
            '--http.addr',
            '0.0.0.0',
            '--port',
            nodeConfig.network.port.toString(),
            '--http.port',
            nodeConfig.network.httpPort.toString(),
            '--engine.legacy',
        ];
        if (nodeConfig.network.port === nodeConfig.network.httpPort) {
            throw new errors_1.ConfigurationError('Port conflict detected', ['Network port and HTTP port must be different'], errors_1.ErrorCode.VALIDATION_ERROR);
        }
        logger.info(`Pulling Docker image: ${imageWithTag}`);
        await docker.pullImage();
        logger.info('Starting Fluent node...');
        await docker.run({
            image: imageWithTag,
            command,
            ports: [
                `${nodeConfig.network.port}:${nodeConfig.network.port}`,
                `${nodeConfig.network.httpPort}:${nodeConfig.network.httpPort}`,
            ],
            volumes: [`${dataDir}:/data`],
            env: hre.config.fluent.env,
        });
        logger.success('Fluent node started successfully', {
            network: nodeConfig.network.chain,
            httpPort: nodeConfig.network.httpPort,
            networkPort: nodeConfig.network.port,
            dataDir: dataDir,
        });
    }
    catch (error) {
        if (error instanceof errors_1.ConfigurationError) {
            logger.error(`[LOCAL-NODE] ${error.message}`, {
                details: error.details,
            });
        }
        else {
            logger.error(`[LOCAL-NODE] Failed to start Fluent node`, {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        throw error;
    }
});
//# sourceMappingURL=index.js.map