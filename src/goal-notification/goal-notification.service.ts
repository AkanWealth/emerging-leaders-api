import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalNotificationService {
  private readonly logger = new Logger(GoalNotificationService.name);

  constructor(private prisma: PrismaService) {}

  // Messages grouped by goal state
  private goalMessages = {
    notStarted: [
      'Your journey is about to start! Let’s take the first step today.',
      'Every big achievement starts with a small action. Begin now!',
    ],
    inProgress: [
      'Keep moving! Every step counts towards your goal.',
      'You’re halfway there — focus on the next milestone!',
    ],
    completed: [
      'Congratulations! You completed your goal — what’s next?',
      'Celebrate your success and plan your next achievement!',
    ],
    inactive: [
      'Go back to your WHY and remember what’s at the heart of this goal.',
      'It’s been a while since you worked on this goal. Let’s get back on track!',
    ],
  };

  // Messages grouped by project state
  private projectMessages = {
    notStarted: ['Your project is waiting to begin. Start a goal today!'],
    inProgress: ['Your project is underway — keep up the momentum!'],
    completed: ['Project completed 🎉 Time to celebrate and plan next steps!'],
  };

  /** Determine goal state */
  private getGoalState(goal: any): 'notStarted' | 'inProgress' | 'completed' | 'inactive' {
    const now = new Date();
    if (goal.isCompleted) return 'completed';
    if (goal.startDate > now) return 'notStarted';
    const lastUpdate = goal.updatedAt || goal.createdAt;
    const diffDays = (now.getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) return 'inactive';
    return 'inProgress';
  }

  /** Determine project state */
  private getProjectState(project: any): 'notStarted' | 'inProgress' | 'completed' {
    if (!project.goals || project.goals.length === 0) return 'notStarted';
    const completedGoals = project.goals.filter(g => g.isCompleted).length;
    if (completedGoals === 0) return 'notStarted';
    if (completedGoals === project.goals.length) return 'completed';
    return 'inProgress';
  }

  /** Get next message for a goal (one at a time) */
  async getNextGoalMessage(userId: string, goal: any) {
    const state = this.getGoalState(goal);
    const msgs = this.goalMessages[state];
    if (!msgs?.length) return null;

    // Track last message shown
    let progress = await this.prisma.userGoalProgress.findFirst({
      where: { userId, goalId: goal.id },
    });

    const lastIdx = progress?.lastMessageIdx ?? -1;
    const nextIdx = lastIdx + 1;
    if (nextIdx >= msgs.length) return null; // all messages shown

    const message = msgs[nextIdx];

    if (progress) {
      await this.prisma.userGoalProgress.update({
        where: { id: progress.id },
        data: { lastMessageIdx: nextIdx },
      });
    } else {
      await this.prisma.userGoalProgress.create({
        data: { userId, goalId: goal.id, lastMessageIdx: nextIdx },
      });
    }

    return {
      goalId: goal.id,
      title: 'Goal Motivation',
      body: message,
      type: 'GOAL_MOTIVATION',
      state,
    };
  }

  /** Get next message for a project (one at a time) */
  async getNextProjectMessage(userId: string, project: any) {
    const state = this.getProjectState(project);
    const msgs = this.projectMessages[state];
    if (!msgs?.length) return null;

    let progress = await this.prisma.userProjectProgress.findFirst({
      where: { userId, projectId: project.id },
    });

    const lastIdx = progress?.lastMessageIdx ?? -1;
    const nextIdx = lastIdx + 1;
    if (nextIdx >= msgs.length) return null;

    const message = msgs[nextIdx];

    if (progress) {
      await this.prisma.userProjectProgress.update({
        where: { id: progress.id },
        data: { lastMessageIdx: nextIdx },
      });
    } else {
      await this.prisma.userProjectProgress.create({
        data: { userId, projectId: project.id, lastMessageIdx: nextIdx },
      });
    }

    return {
      projectId: project.id,
      title: 'Project Update',
      body: message,
      type: 'PROJECT_MOTIVATION',
      state,
    };
  }

  /** Fetch all messages to show today for a user (one per goal/project) */
  async getTodayMessages(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { projects: { userId } },
      include: { projects: true },
    });

    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: { goals: true },
    });

    const messages: Array<{
      goalId?: string;
      projectId?: string;
      title: string;
      body: string;
      type: string;
      state?: 'notStarted' | 'inProgress' | 'completed' | 'inactive';
    }> = [];

    for (const goal of goals) {
      const msg = await this.getNextGoalMessage(userId, goal);
      if (msg) messages.push(msg);
    }

    for (const project of projects) {
      const msg = await this.getNextProjectMessage(userId, project);
      if (msg) messages.push(msg);
    }

    return messages;
  }
}
