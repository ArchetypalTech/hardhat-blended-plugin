"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerManager = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("../../utils/logger");
class DockerManager {
    constructor(config) {
        this.config = config;
        this.logger = new logger_1.Logger({ showTimestamp: true });
    }
    async pullImage() {
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
            }
            catch (_a) {
                this.logger.warn('Docker image not found, pulling...', { image: imageWithTag });
            }
        }
        this.logger.info('Pulling Docker image...', { image: imageWithTag });
        try {
            await this.execCommand('docker', ['pull', imageWithTag]);
            this.logger.success('Docker image pulled successfully.', { image: imageWithTag });
        }
        catch (error) {
            this.logger.error('Failed to pull Docker image.', { image: imageWithTag, error });
            throw error;
        }
    }
    async run(options) {
        var _a, _b;
        const args = ['run', '--rm', '-it'];
        // Add ports
        if ((_a = options.ports) === null || _a === void 0 ? void 0 : _a.length) {
            options.ports.forEach((port) => args.push('-p', port));
            this.logger.info('Added port mappings.', { ports: options.ports });
        }
        // Add volumes
        if ((_b = options.volumes) === null || _b === void 0 ? void 0 : _b.length) {
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
            const process = (0, child_process_1.spawn)('docker', args, { stdio: 'inherit' });
            process.on('error', (error) => {
                this.logger.error('Failed to start Docker container.', { error });
                reject(error);
            });
            process.on('close', (code) => {
                if (code !== 0) {
                    this.logger.error('Docker process exited with an error.', { code });
                    reject(new Error(`Docker process exited with code ${code}`));
                }
                else {
                    this.logger.success('Docker container ran successfully.');
                    resolve();
                }
            });
        });
    }
    execCommand(command, args) {
        this.logger.info('Executing command.', { command, args });
        return new Promise((resolve, reject) => {
            const process = (0, child_process_1.spawn)(command, args, { stdio: 'inherit' });
            process.on('error', (error) => {
                this.logger.error('Command execution failed.', { command, args, error });
                reject(error);
            });
            process.on('close', (code) => {
                if (code !== 0) {
                    this.logger.error('Command exited with an error.', { command, args, code });
                    reject(new Error(`Command failed with code ${code}`));
                }
                else {
                    this.logger.success('Command executed successfully.', { command, args });
                    resolve();
                }
            });
        });
    }
}
exports.DockerManager = DockerManager;
//# sourceMappingURL=index.js.map