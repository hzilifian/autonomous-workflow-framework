"use strict";
/**
 * Plan Agent - Creates detailed implementation plan
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
exports.PlanAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const path = __importStar(require("path"));
class PlanAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('plan', 'sonnet');
    }
    async execute(input) {
        try {
            // Read scout report
            const scoutReport = await this.readScoutReport(input.context.worktreePath);
            // Generate plan
            const plan = await this.generatePlan(input, scoutReport);
            // Save plan files
            await this.savePlan(input.context.worktreePath, plan);
            return {
                success: true,
                data: { plan },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    getSystemPrompt(input) {
        return `You are a Plan Agent creating detailed implementation plans.

Create a comprehensive plan including:
1. Architecture design
2. File changes and additions
3. Step-by-step implementation
4. Risk assessment
5. ${input.projectType === 'mobile' ? 'Mobile-specific considerations (performance, offline, UX)' : 'Web-specific considerations (SEO, accessibility, Core Web Vitals)'}

Be specific and actionable.`;
    }
    getUserPrompt(input) {
        return `Create an implementation plan for: ${input.taskDescription}

Based on scout findings, provide:
- Architecture diagram (text-based)
- Files to create/modify
- Implementation steps
- Dependencies needed
- Performance considerations
- Security considerations
- Testing strategy`;
    }
    async readScoutReport(worktreePath) {
        const reportPath = path.join(worktreePath, 'scout-report.json');
        const content = await this.readFile(reportPath);
        return JSON.parse(content);
    }
    async generatePlan(input, scoutReport) {
        const prompt = `${this.getUserPrompt(input)}

**Scout Report:**
${JSON.stringify(scoutReport, null, 2)}`;
        return await this.callClaude(this.getSystemPrompt(input), prompt, 8192);
    }
    async savePlan(worktreePath, plan) {
        await this.writeFile(path.join(worktreePath, 'implementation-plan.md'), plan);
    }
}
exports.PlanAgent = PlanAgent;
