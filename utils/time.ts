import { Training } from '../types';

export const getTrainingEndTime = (training: Training): Date => {
  const trainingDate = new Date(training.date);
  const endTimeStr = training.schedule.split(' - ')[1];
  const [time, period] = endTimeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
  if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;
  
  trainingDate.setHours(hours, minutes, 0, 0);
  return trainingDate;
};

export const isTrainingFinished = (training: Training): boolean => {
  const endTime = getTrainingEndTime(training);
  return new Date() > endTime;
};

export const isSixHoursAfterEnd = (training: Training): boolean => {
  const endTime = getTrainingEndTime(training);
  const sixHoursLater = new Date(endTime.getTime() + 6 * 60 * 60 * 1000);
  return new Date() > sixHoursLater;
};
