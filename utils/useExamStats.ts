import { ExamResult } from '../types';

export interface ExamStats {
  totalParticipations: number;
  totalPassed: number;
  totalFailed: number;
  passRate: number;
  failRate: number;
  averageScore: number;
  lastMonthCount: number;
  scoreVariation: number; // Placeholder for now
}

export const useExamStats = (results: ExamResult[]): ExamStats => {
  const totalParticipations = results.length;
  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = totalParticipations - totalPassed;
  const passRate = totalParticipations > 0
    ? Math.round((totalPassed / totalParticipations) * 100) : 0;
  const averageScore = totalParticipations > 0
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalParticipations) : 0;

  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const lastMonthResults = results.filter(r => new Date(r.completedAt) >= oneMonthAgo);
  const lastMonthCount = lastMonthResults.length;

  // This is a simplified calculation for score variation.
  // A more robust implementation would compare with the previous 30-day period.
  const scoreVariation = 0; 

  return {
    totalParticipations,
    totalPassed,
    totalFailed,
    passRate,
    failRate: 100 - passRate,
    averageScore,
    lastMonthCount,
    scoreVariation,
  };
};
