import { task } from 'hardhat/config';

import { DockerManager } from '../../internal/docker';
import { Logger } from '../../utils/logger';
import path from 'path';
import { ensureDirSync } from 'fs-extra';
import { ConfigurationError, ErrorCode } from '../../config/errors';

const TASK_RUN_LOCAL_NODE = 'node:fluent';
const logger = new Logger({ showTimestamp: true });

task(TASK_RUN_LOCAL_NODE, 'Runs a Fluent node in a Docker container').setAction(async (_, hre) => {
  const nodeConfig = hre.config.fluent.node;
  const docker = new DockerManager(nodeConfig);

  try {
    const dataDir = path.resolve(process.cwd(), nodeConfig.network.dataDir);
    ensureDirSync(dataDir);

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
      throw new ConfigurationError(
        'Port conflict detected',
        ['Network port and HTTP port must be different'],
        ErrorCode.VALIDATION_ERROR,
      );
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
  } catch (error) {
    if (error instanceof ConfigurationError) {
      logger.error(`[LOCAL-NODE] ${error.message}`, {
        details: error.details,
      });
    } else {
      logger.error(`[LOCAL-NODE] Failed to start Fluent node`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
});
