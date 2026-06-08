import { Check } from 'lucide-react';

interface Step {
  label: string;
  icon: React.ReactNode;
}

export function StepIndicator({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
              ${i < currentStep ? 'bg-red-400 text-white scale-100' : ''}
              ${i === currentStep ? 'bg-red-400 text-white scale-110 shadow-[0_0_20px_rgba(0,0,0,0.2)]' : ''}
              ${i > currentStep ? 'bg-surface-elevated text-text-subdued' : ''}
            `}>
              {i < currentStep ? <Check size={18} /> : i + 1}
            </div>
            <span className={`
              text-[10px] mt-1.5 font-medium whitespace-nowrap transition-colors duration-300
              ${i <= currentStep ? 'text-text-primary' : 'text-text-subdued'}
            `}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`
              w-12 sm:w-20 h-0.5 mx-2 rounded transition-colors duration-500
              ${i < currentStep ? 'bg-red-400' : 'bg-surface-elevated'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}
