/**
 * Configuration presets for mobile and web projects
 */

import { FrameworkConfig } from '../types';

export const mobilePreset: Partial<FrameworkConfig> = {
  projectType: 'mobile',
  mobile: {
    platform: 'both',
    framework: 'react-native',
    minCoverage: 80,
    performanceBudget: {
      bundleSize: 10000,
      timeToInteractive: 3000,
      memoryUsage: 200,
      apiCallLimit: 50,
    },
  },
};

export const webPreset: Partial<FrameworkConfig> = {
  projectType: 'web',
  web: {
    buildTool: 'vite',
    styling: 'tailwind',
    uiFramework: 'shadcn',
    backend: 'supabase',
    minCoverage: 85,
    performanceBudget: {
      bundleSize: 200,
      lighthouseScore: 90,
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      tti: 3000,
    },
    seo: true,
    accessibility: 'wcag-aa',
  },
};

export const defaultConfig: FrameworkConfig = {
  projectType: 'web',
  worktree: {
    baseDir: '.worktrees',
    autoCleanup: true,
    cleanupTimeout: 60,
    maxConcurrent: 3,
  },
  cto: {
    strictMode: true,
    autoApproveThreshold: 85,
    requireExplicitApproval: false,
  },
  stages: {
    scout: { enabled: true, timeout: 10, retryCount: 2, parallel: false, modelPreference: 'sonnet' },
    plan: { enabled: true, timeout: 15, retryCount: 3, parallel: false, modelPreference: 'sonnet' },
    build: { enabled: true, timeout: 30, retryCount: 3, parallel: false, modelPreference: 'sonnet' },
    test: { enabled: true, timeout: 20, retryCount: 2, parallel: false, modelPreference: 'sonnet' },
    review: { enabled: true, timeout: 10, retryCount: 1, parallel: false, modelPreference: 'sonnet' },
  },
  qualityGates: {
    enabled: true,
    requiredScore: 80,
    criticalIssueBlock: true,
  },
  ...webPreset,
};
