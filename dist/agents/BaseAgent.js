"use strict";
/**
 * Base Agent class
 *
 * Provides common functionality for all agents
 */
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class BaseAgent {
    constructor(stageType, modelPreference = 'sonnet') {
        this.client = new sdk_1.default({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.stageType = stageType;
        this.modelPreference = modelPreference;
    }
    /**
     * Get the Claude model ID based on preference
     */
    getModel() {
        const models = {
            opus: 'claude-opus-4-20250514',
            sonnet: 'claude-sonnet-4-5-20250929',
            haiku: 'claude-3-5-haiku-20241022',
        };
        return models[this.modelPreference];
    }
    /**
     * Call Claude API
     */
    async callClaude(systemPrompt, userPrompt, maxTokens = 4096) {
        try {
            const response = await this.client.messages.create({
                model: this.getModel(),
                max_tokens: maxTokens,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return content.text;
            }
            throw new Error('Unexpected response type from Claude');
        }
        catch (error) {
            throw new Error(`Claude API call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Parse JSON from Claude response
     */
    parseJSON(text) {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        try {
            return JSON.parse(jsonText);
        }
        catch (error) {
            throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Read file from worktree
     */
    async readFile(filePath) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        try {
            return await fs.readFile(filePath, 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Write file to worktree
     */
    async writeFile(filePath, content) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        try {
            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * List files in directory
     */
    async listFiles(dirPath, recursive = false) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const files = [];
        async function scan(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                // Skip node_modules, .git, etc.
                if (entry.name === 'node_modules' ||
                    entry.name === '.git' ||
                    entry.name === 'dist' ||
                    entry.name === 'build' ||
                    entry.name.startsWith('.')) {
                    continue;
                }
                if (entry.isDirectory()) {
                    if (recursive) {
                        await scan(fullPath);
                    }
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        await scan(dirPath);
        return files;
    }
    /**
     * Execute shell command in worktree
     */
    async executeCommand(command, cwd) {
        const { exec } = await Promise.resolve().then(() => __importStar(require('child_process')));
        const { promisify } = await Promise.resolve().then(() => __importStar(require('util')));
        const execAsync = promisify(exec);
        try {
            return await execAsync(command, { cwd });
        }
        catch (error) {
            return {
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
            };
        }
    }
}
exports.BaseAgent = BaseAgent;
