import { Training } from '../types';

export function isRegistrationOpen(training: Training): boolean {
  if (!training.registration_deadline) return true; // Si no hay deadline, asumimos abierto (aunque debería ser obligatorio)
  const now = new Date();
  const deadline = new Date(training.registration_deadline);
  return now < deadline;
}

export function getHoursUntilDeadline(deadlineStr: string): number {
  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60);
}
