import React from "react";
import { CheckCircleIcon } from "lucide-react";
interface TimelineItemProps {
  label: string;
  isCompleted: boolean;
  isNext?: boolean;
  date: string;
  altText: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  label,
  isCompleted,
  isNext,
  date,
  altText,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`flex items-center justify-center rounded-full h-6 w-6 ${
          isCompleted
            ? "bg-green-500 text-white"
            : isNext
            ? "bg-blue-500 text-white animate-pulse"
            : "bg-gray-300 text-gray-500"
        }`}
        title={altText}
      >
        {isCompleted ? (
          <CheckCircleIcon className="h-6 w-6" />
        ) : (
          <span>{isNext ? "" : ""}</span>
        )}
      </div>
      <div>
        <div
          className={`text-sm ${
            isCompleted ? "text-gray-700" : "text-gray-500"
          } ${isNext ? "font-medium text-blue-700" : ""}`}
        >
          {label}
        </div>
        <div className="text-xs text-gray-400">{date}</div>
      </div>
    </div>
  );
};

interface TransactionTimelineProps {
  steps: {
    label: string;
    isCompleted: boolean;
    date: string;
    altText: string;
  }[];
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  steps,
}) => {
  const nextIndex = steps.findIndex((step) => !step.isCompleted);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <TimelineItem
            key={index}
            label={step.label}
            isCompleted={step.isCompleted}
            isNext={index === nextIndex}
            date={step.date}
            altText={step.altText}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionTimeline;
