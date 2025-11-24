"use strict";
/**
 * Build Agent - Implements the planned changes
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const path = __importStar(require("path"));
class BuildAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('build', 'sonnet');
    }
    async execute(input) {
        try {
            const plan = await this.readFile(path.join(input.context.worktreePath, 'implementation-plan.md'));
            const scoutReport = await this.readFile(path.join(input.context.worktreePath, 'scout-report.json'));
            const implementation = await this.implementChanges(input, plan, scoutReport);
            const fileChanges = await this.applyChanges(input.context.worktreePath, implementation);
            await this.saveSum(input.context.worktreePath, implementation);
            return {
                success: true,
                data: { implementation },
                files: fileChanges,
            };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    getSystemPrompt(input) {
        return `You are a Build Agent implementing code changes.

Generate high-quality, production-ready code following:
- Project conventions and patterns
- Best practices for ${input.projectType}
- Proper error handling
- Type safety
- Accessibility standards
- Performance optimization

Output file changes in JSON format:
{ "files": [{ "path": "...", "action": "create|modify", "content": "..." }] }`;
    }
    getUserPrompt(input) {
        return `Implement: ${input.taskDescription}

Follow the plan and scout findings to generate code.`;
    }
    async implementChanges(input, plan, scoutReport) {
        const prompt = `${this.getUserPrompt(input)}

**Plan:**
${plan}

**Scout Report:**
${scoutReport}

Generate the code changes as JSON.`;
        return await this.callClaude(this.getSystemPrompt(input), prompt, 8192);
    }
    async applyChanges(worktreePath, implementation) {
        try {
            const parsed = this.parseJSON(implementation);
            for (const file of parsed.files) {
                const fullPath = path.join(worktreePath, file.path);
                if (file.action === 'create' || file.action === 'modify') {
                    await this.writeFile(fullPath, file.content || '');
                }
            }
            return parsed.files;
        }
        catch {
            return [];
        }
    }
    async saveSum(worktreePath, implementation) {
        await this.writeFile(path.join(worktreePath, 'build-summary.md'), implementation);
    }
}
exports.BuildAgent = BuildAgent;
