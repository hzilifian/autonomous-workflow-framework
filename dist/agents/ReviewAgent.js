"use strict";
/**
 * Review Agent - Final code review and quality checks
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
exports.ReviewAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const path = __importStar(require("path"));
class ReviewAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('review', 'sonnet');
    }
    async execute(input) {
        try {
            const review = await this.performReview(input);
            await this.writeFile(path.join(input.context.worktreePath, 'review-report.md'), review);
            return { success: true, data: { review } };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    getSystemPrompt(input) {
        return `You are a Review Agent performing final quality checks.

Review:
- Code quality
- Security vulnerabilities
- Performance
- Accessibility
- ${input.projectType === 'mobile' ? 'Mobile guidelines compliance' : 'Web standards (Lighthouse score, SEO)'}
- Documentation

Provide actionable feedback.`;
    }
    getUserPrompt(input) {
        return `Review the implementation of: ${input.taskDescription}

Check all quality metrics and provide final assessment.`;
    }
    async performReview(input) {
        const testSummary = await this.readFile(path.join(input.context.worktreePath, 'test-summary.md')).catch(() => '');
        return await this.callClaude(this.getSystemPrompt(input), `${this.getUserPrompt(input)}\n\n**Test Results:**\n${testSummary}`, 8192);
    }
}
exports.ReviewAgent = ReviewAgent;
