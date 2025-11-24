/**
 * Worktree Manager for parallel agent execution
 *
 * Manages git worktrees to enable parallel agent execution in isolated environments
 * with automatic cleanup on completion or timeout.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { WorktreeInfo, StageType, WorktreeConfig } from '../types';

const execAsync = promisify(exec);

export class WorktreeManager {
  private worktrees: Map<string, WorktreeInfo> = new Map();
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: WorktreeConfig;
  private projectPath: string;

  constructor(projectPath: string, config: WorktreeConfig) {
    this.projectPath = projectPath;
    this.config = config;
  }

  /**
   * Create a new worktree for an agent
   */
  async createWorktree(
    workflowId: string,
    stageType: StageType,
    agentId: string
  ): Promise<WorktreeInfo> {
    // Check concurrent limit
    const activeWorktrees = Array.from(this.worktrees.values()).filter(
      (w) => w.status === 'active'
    );

    if (activeWorktrees.length >= this.config.maxConcurrent) {
      throw new Error(
        `Maximum concurrent worktrees (${this.config.maxConcurrent}) reached`
      );
    }

    const worktreeId = `${stageType}-${workflowId}-${Date.now()}`;
    const worktreePath = path.join(
      this.projectPath,
      this.config.baseDir,
      worktreeId
    );

    try {
      // Ensure base directory exists
      await fs.mkdir(path.join(this.projectPath, this.config.baseDir), {
        recursive: true,
      });

      // Create worktree using git
      await execAsync(`git worktree add ${worktreePath}`, {
        cwd: this.projectPath,
      });

      const worktreeInfo: WorktreeInfo = {
        id: worktreeId,
        stageType,
        path: worktreePath,
        createdAt: new Date(),
        status: 'active',
        agentId,
      };

      this.worktrees.set(worktreeId, worktreeInfo);

      // Set up auto-cleanup timeout if enabled
      if (this.config.autoCleanup) {
        this.scheduleCleanup(worktreeId);
      }

      return worktreeInfo;
    } catch (error) {
      throw new Error(
        `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Remove a worktree and clean up
   */
  async removeWorktree(worktreeId: string): Promise<void> {
    const worktree = this.worktrees.get(worktreeId);

    if (!worktree) {
      throw new Error(`Worktree ${worktreeId} not found`);
    }

    if (worktree.status === 'cleaning') {
      // Already being cleaned
      return;
    }

    // Update status
    worktree.status = 'cleaning';
    this.worktrees.set(worktreeId, worktree);

    // Cancel cleanup timer
    const timer = this.cleanupTimers.get(worktreeId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(worktreeId);
    }

    try {
      // Save logs/outputs (if any) before removing
      await this.saveLogs(worktree);

      // Remove worktree
      await execAsync(`git worktree remove ${worktree.path} --force`, {
        cwd: this.projectPath,
      });

      // Prune references
      await execAsync('git worktree prune', {
        cwd: this.projectPath,
      });

      // Mark as cleaned
      worktree.status = 'cleaned';
      this.worktrees.set(worktreeId, worktree);

      // Remove from active tracking after delay
      setTimeout(() => {
        this.worktrees.delete(worktreeId);
      }, 60000); // Keep for 1 minute for status checks
    } catch (error) {
      throw new Error(
        `Failed to remove worktree: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get worktree info
   */
  getWorktree(worktreeId: string): WorktreeInfo | undefined {
    return this.worktrees.get(worktreeId);
  }

  /**
   * Get all worktrees
   */
  getAllWorktrees(): WorktreeInfo[] {
    return Array.from(this.worktrees.values());
  }

  /**
   * Get active worktrees
   */
  getActiveWorktrees(): WorktreeInfo[] {
    return Array.from(this.worktrees.values()).filter(
      (w) => w.status === 'active'
    );
  }

  /**
   * Schedule automatic cleanup for a worktree
   */
  private scheduleCleanup(worktreeId: string): void {
    const timeoutMs = this.config.cleanupTimeout * 60 * 1000; // Convert minutes to ms

    const timer = setTimeout(async () => {
      try {
        console.log(`Auto-cleaning worktree ${worktreeId} after timeout`);
        await this.removeWorktree(worktreeId);
      } catch (error) {
        console.error(`Failed to auto-clean worktree ${worktreeId}:`, error);
      }
    }, timeoutMs);

    this.cleanupTimers.set(worktreeId, timer);
  }

  /**
   * Save logs and outputs before cleanup
   */
  private async saveLogs(worktree: WorktreeInfo): Promise<void> {
    try {
      const logsDir = path.join(
        this.projectPath,
        '.worktree-logs',
        worktree.id
      );

      await fs.mkdir(logsDir, { recursive: true });

      // Save worktree metadata
      await fs.writeFile(
        path.join(logsDir, 'metadata.json'),
        JSON.stringify(worktree, null, 2)
      );

      // Could save git diff, git log, etc. here if needed
    } catch (error) {
      console.warn('Failed to save worktree logs:', error);
      // Don't throw - cleanup should continue even if logging fails
    }
  }

  /**
   * Clean up all worktrees (emergency cleanup)
   */
  async cleanupAll(): Promise<void> {
    const worktreeIds = Array.from(this.worktrees.keys());

    for (const id of worktreeIds) {
      try {
        await this.removeWorktree(id);
      } catch (error) {
        console.error(`Failed to cleanup worktree ${id}:`, error);
      }
    }
  }

  /**
   * Daily cleanup job - removes old worktrees
   */
  async pruneOldWorktrees(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, worktree] of this.worktrees.entries()) {
      const age = now - worktree.createdAt.getTime();

      if (age > maxAge) {
        try {
          console.log(`Pruning old worktree ${id}`);
          await this.removeWorktree(id);
        } catch (error) {
          console.error(`Failed to prune worktree ${id}:`, error);
        }
      }
    }
  }

  /**
   * Get worktree utilization metrics
   */
  getUtilization(): {
    active: number;
    total: number;
    utilizationRate: number;
  } {
    const active = this.getActiveWorktrees().length;
    const total = this.config.maxConcurrent;

    return {
      active,
      total,
      utilizationRate: total > 0 ? active / total : 0,
    };
  }

  /**
   * Check if a worktree exists on filesystem
   */
  async worktreeExists(worktreeId: string): Promise<boolean> {
    const worktree = this.worktrees.get(worktreeId);

    if (!worktree) {
      return false;
    }

    try {
      await fs.access(worktree.path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Shutdown - cleanup all resources
   */
  async shutdown(): Promise<void> {
    // Clear all timers
    for (const timer of this.cleanupTimers.values()) {
      clearTimeout(timer);
    }
    this.cleanupTimers.clear();

    // Cleanup all worktrees if configured
    if (this.config.autoCleanup) {
      await this.cleanupAll();
    }
  }
}
