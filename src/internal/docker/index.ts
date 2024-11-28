import { spawn } from 'child_process';
import { NodeSettings } from '../../config';
import { Logger } from '../../utils/logger';
import { DockerRunOptions } from './types';

export class DockerManager {
  private logger: Logger;

  constructor(private config: NodeSettings) {
    this.logger = new Logger({ showTimestamp: true });
  }

  async pullImage(): Promise<void> {
    if (this.config.docker.pull === 'never') {
      this.logger.info('Docker image pull skipped (config: never).', {
        image: this.config.docker.image,
      });
      return;
    }

    const imageWithTag = `${this.config.docker.image}:${this.config.docker.tag || 'latest'}`;

    if (this.config.docker.pull === 'if-not-present') {
      try {
        this.logger.info('Checking if Docker image is already present.', { image: imageWithTag });
        await this.execCommand('docker', ['image', 'inspect', imageWithTag]);
        this.logger.success('Docker image is already present.', { image: imageWithTag });
        return;
      } catch {
        this.logger.warn('Docker image not found, pulling...', { image: imageWithTag });
      }
    }

    this.logger.info('Pulling Docker image...', { image: imageWithTag });
    try {
      await this.execCommand('docker', ['pull', imageWithTag]);
      this.logger.success('Docker image pulled successfully.', { image: imageWithTag });
    } catch (error) {
      this.logger.error('Failed to pull Docker image.', { image: imageWithTag, error });
      throw error;
    }
  }

  async run(options: DockerRunOptions): Promise<void> {
    const args = ['run', '--rm', '-it'];

    // Add ports
    if (options.ports?.length) {
      options.ports.forEach((port) => args.push('-p', port));
      this.logger.info('Added port mappings.', { ports: options.ports });
    }

    // Add volumes
    if (options.volumes?.length) {
      options.volumes.forEach((volume) => args.push('-v', volume));
      this.logger.info('Added volume mappings.', { volumes: options.volumes });
    }

    // Add environment variables
    if (options.env) {
      Object.entries(options.env).forEach(([key, value]) => {
        args.push('-e', `${key}=${value}`);
      });
      this.logger.info('Added environment variables.', { env: options.env });
    }

    // Add workdir
    if (options.workdir) {
      args.push('-w', options.workdir);
      this.logger.info('Set working directory.', { workdir: options.workdir });
    }

    // Add network
    if (options.network) {
      args.push('--network', options.network);
      this.logger.info('Set network.', { network: options.network });
    }

    // Add image and command
    args.push(options.image);
    args.push(...options.command);
    this.logger.info('Preparing to run Docker container.', { args });

    return new Promise((resolve, reject) => {
      const process = spawn('docker', args, { stdio: 'inherit' });
      process.on('error', (error) => {
        this.logger.error('Failed to start Docker container.', { error });
        reject(error);
      });
      process.on('close', (code) => {
        if (code !== 0) {
          this.logger.error('Docker process exited with an error.', { code });
          reject(new Error(`Docker process exited with code ${code}`));
        } else {
          this.logger.success('Docker container ran successfully.');
          resolve();
        }
      });
    });
  }

  private execCommand(command: string, args: string[]): Promise<void> {
    this.logger.info('Executing command.', { command, args });
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'inherit' });
      process.on('error', (error) => {
        this.logger.error('Command execution failed.', { command, args, error });
        reject(error);
      });
      process.on('close', (code) => {
        if (code !== 0) {
          this.logger.error('Command exited with an error.', { command, args, code });
          reject(new Error(`Command failed with code ${code}`));
        } else {
          this.logger.success('Command executed successfully.', { command, args });
          resolve();
        }
      });
    });
  }
}
