import {
  mockPracticePlan,
  mockProgressSummary,
  mockSessionRecaps,
  mockTeacherDashboardStudents,
  mockStudentProfile,
  mockTeacherMessages,
} from "../core/mockData";
import type { MusicTeacherService, TeacherPrompt } from "./contracts";

const wait = (milliseconds = 180) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function createMockMusicTeacherService(): MusicTeacherService {
  return {
    async getProfile() {
      await wait();
      return mockStudentProfile;
    },
    async getTodayPracticePlan() {
      await wait();
      return mockPracticePlan;
    },
    async getProgressSummary() {
      await wait();
      return mockProgressSummary;
    },
    async getRecentRecaps() {
      await wait();
      return mockSessionRecaps;
    },
    async getTeacherDashboardStudents() {
      await wait();
      return mockTeacherDashboardStudents;
    },
    async getTeacherThread() {
      await wait();
      return mockTeacherMessages;
    },
    async sendTeacherMessage(prompt: TeacherPrompt) {
      await wait(320);
      return {
        id: crypto.randomUUID(),
        role: "teacher",
        content: `Let's make that practical: ${prompt.message} Start with one slow repetition, listen for the exact spot that changes, then repeat only that measure three times.`,
      };
    },
  };
}
