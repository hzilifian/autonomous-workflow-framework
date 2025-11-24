"use strict";
/**
 * Test Agent - Generates and runs tests
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
exports.TestAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const path = __importStar(require("path"));
class TestAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('test', 'sonnet');
    }
    async execute(input) {
        try {
            const buildSummary = await this.readFile(path.join(input.context.worktreePath, 'build-summary.md'));
            const tests = await this.generateTests(input, buildSummary);
            await this.writeTestFiles(input.context.worktreePath, tests);
            const results = await this.runTests(input.context.worktreePath);
            await this.saveResults(input.context.worktreePath, results);
            return {
                success: true,
                data: { tests, results },
            };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    getSystemPrompt(input) {
        return `You are a Test Agent generating comprehensive tests.

Generate:
- Unit tests
- Integration tests
- ${input.projectType === 'mobile' ? 'E2E tests (Detox/Appium)' : 'E2E tests (Playwright/Cypress)'}
- Accessibility tests
- Edge cases

Use appropriate testing framework for the project.`;
    }
    getUserPrompt(input) {
        return `Generate tests for: ${input.taskDescription}

Ensure >80% coverage and test edge cases.`;
    }
    async generateTests(input, buildSummary) {
        return await this.callClaude(this.getSystemPrompt(input), `${this.getUserPrompt(input)}\n\n**Build Summary:**\n${buildSummary}`, 8192);
    }
    async writeTestFiles(worktreePath, tests) {
        // Parse and write test files (simplified)
        await this.writeFile(path.join(worktreePath, 'tests-generated.txt'), tests);
    }
    async runTests(worktreePath) {
        // Run tests (simplified - would run actual test commands)
        const { stdout, stderr } = await this.executeCommand('npm test || echo "No tests configured"', worktreePath);
        return `${stdout}\n${stderr}`;
    }
    async saveResults(worktreePath, results) {
        await this.writeFile(path.join(worktreePath, 'test-summary.md'), results);
    }
}
exports.TestAgent = TestAgent;
