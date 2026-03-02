import React from 'react';

interface TimelineTrackerProps {
    steps: {
        label: string;
        status: 'completed' | 'current' | 'pending' | 'rejected';
        date?: string;
    }[];
}

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({ steps }) => {
    return (
        <div className="py-6">
            <div className="relative">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200" aria-hidden="true" />
                <ul className="relative flex justify-between w-full">
                    {steps.map((step, index) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';
                        const isRejected = step.status === 'rejected';

                        let bgColor = 'bg-white';
                        let borderColor = 'border-slate-300';
                        let textColor = 'text-slate-500';
                        let icon = null;

                        if (isCompleted) {
                            bgColor = 'bg-green-500';
                            borderColor = 'border-green-500';
                            textColor = 'text-green-700 font-medium';
                            icon = <i className="fas fa-check text-white text-xs"></i>;
                        } else if (isCurrent) {
                            bgColor = 'bg-indigo-600';
                            borderColor = 'border-indigo-600 ring-4 ring-indigo-50';
                            textColor = 'text-indigo-700 font-bold';
                            icon = <i className="fas fa-circle text-white text-[8px]"></i>;
                        } else if (isRejected) {
                            bgColor = 'bg-red-500';
                            borderColor = 'border-red-500';
                            textColor = 'text-red-600 font-bold';
                            icon = <i className="fas fa-times text-white text-xs"></i>;
                        }

                        return (
                            <li key={index} className="relative w-full">
                                {/* Connector Line Fill */}
                                {index !== steps.length - 1 && (isCompleted || (isCurrent && steps[index + 1]?.status !== 'rejected')) && (
                                    <div className="absolute top-5 left-1/2 w-full h-0.5 bg-green-500" />
                                )}
                                {index !== 0 && isRejected && (
                                    <div className="absolute top-5 right-1/2 w-full h-0.5 bg-red-400" />
                                )}

                                <div className="group flex flex-col items-center relative z-10">
                                    <span className={`w-10 h-10 flex items-center justify-center border-2 rounded-full transition-all duration-300 mb-3 ${bgColor} ${borderColor}`}>
                                        {icon}
                                    </span>
                                    <span className={`text-xs text-center px-2 max-w-[120px] ${textColor}`}>
                                        {step.label}
                                    </span>
                                    {step.date && (
                                        <span className="text-[10px] text-slate-400 mt-1">{step.date}</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
