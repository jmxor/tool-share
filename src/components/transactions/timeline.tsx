import React from "react";
import { CheckCircleIcon } from "lucide-react";
import { TimelineStep } from "@/app/transactions/[transaction_id]/page";

interface TimelineItemProps {
  isCompleted: boolean;
  isNext?: boolean;
  date: string;
  pendingText: string;
  completedText: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  isCompleted,
  isNext,
  date,
  pendingText,
  completedText,
  isLast,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        <div
          className={`flex items-center justify-center rounded-full h-6 w-6 ${
            isCompleted
              ? "bg-green-500 text-white"
              : isNext
              ? "bg-blue-500 text-white animate-pulse"
              : "bg-gray-300 text-gray-500"
          }`}
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
            {isCompleted ? completedText : pendingText}
          </div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>
      {!isLast && (
        <div className="absolute left-3 top-8 w-0.5 h-6 -translate-x-1/2 bg-gray-300"></div>
      )}
    </div>
  );
};

interface TransactionTimelineProps {
  steps: TimelineStep[];
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  steps,
}) => {
  const nextIndex = steps.findIndex((step) => !step.isCompleted);
  return (
    <div className="w-full">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <TimelineItem
            key={index}
            isCompleted={step.isCompleted}
            isNext={index === nextIndex}
            date={step.date}
            pendingText={step.pendingText}
            completedText={step.completedText}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionTimeline;
