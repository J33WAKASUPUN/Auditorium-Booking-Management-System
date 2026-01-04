import { Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStepperProps {
  currentStatus: string;
  compact?: boolean;
  recommendationStatus?: {
    status: string;
    cancellationReason?: string;
  };
  approvalStatus?: {
    status: string;
    cancellationReason?: string;
  };
}

const WorkflowStepper = ({
  currentStatus,
  compact = false,
  recommendationStatus,
  approvalStatus,
}: WorkflowStepperProps) => {
  // ✅ UPDATED: New workflow steps
  const steps = [
    { id: 1, label: 'Created', status: 'pending_approval' },
    { id: 2, label: 'Recommended', status: 'recommended' },
    { id: 3, label: 'Approved', status: 'approved' },
    { id: 4, label: 'Payment', status: 'payment_confirmed' },
  ];

  const getStepState = (stepId: number) => {
    // Check if booking was cancelled at this step
    if (currentStatus === 'cancelled') {
      if (stepId === 1) return 'error';
      return 'pending';
    }

    // Check recommendation cancellation
    if (recommendationStatus?.status === 'cancelled' && stepId === 2) {
      return 'error';
    }

    // Check approval cancellation
    if (approvalStatus?.status === 'cancelled' && stepId === 3) {
      return 'error';
    }

    // All steps complete (payment_confirmed or completed)
    if (currentStatus === 'payment_confirmed' || currentStatus === 'completed') {
      return 'complete';
    }

    // ✅ UPDATED: Step-by-step progression for new workflow
    switch (stepId) {
      case 1:
        // Step 1: Created (pending_approval)
        if (
          currentStatus === 'pending_approval' ||
          currentStatus === 'recommended' ||
          currentStatus === 'approved' ||
          currentStatus === 'payment_pending' ||
          currentStatus === 'payment_confirmed'
        ) {
          return 'complete';
        }
        return 'pending';

      case 2:
        // Step 2: Recommended
        if (
          currentStatus === 'recommended' ||
          currentStatus === 'approved' ||
          currentStatus === 'payment_pending' ||
          currentStatus === 'payment_confirmed'
        ) {
          return 'complete';
        }
        if (currentStatus === 'pending_approval') {
          return 'active';
        }
        return 'pending';

      case 3:
        // Step 3: Approved
        if (
          currentStatus === 'approved' ||
          currentStatus === 'payment_pending' ||
          currentStatus === 'payment_confirmed'
        ) {
          return 'complete';
        }
        if (currentStatus === 'recommended') {
          return 'active';
        }
        return 'pending';

      case 4:
        // Step 4: Payment (payment_pending → payment_confirmed)
        if (currentStatus === 'payment_confirmed' || currentStatus === 'completed') {
          return 'complete';
        }
        if (currentStatus === 'payment_pending' || currentStatus === 'approved') {
          return 'active';
        }
        return 'pending';

      default:
        return 'pending';
    }
  };

  const getCircleClass = (state: string) => {
    switch (state) {
      case 'complete':
        return 'bg-green-500 border-green-500 text-white';
      case 'active':
        return 'bg-yellow-500 border-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 border-red-500 text-white';
      case 'pending':
      default:
        return 'bg-gray-200 border-gray-300 text-gray-500';
    }
  };

  const getLineClass = (fromState: string, toState: string) => {
    if (fromState === 'complete' && (toState === 'complete' || toState === 'active')) {
      return 'bg-green-500';
    }
    if (fromState === 'error' || toState === 'error') {
      return 'bg-red-500';
    }
    return 'bg-gray-300';
  };

  const getIcon = (state: string) => {
    switch (state) {
      case 'complete':
        return <Check className="w-4 h-4" />;
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const nextState = index < steps.length - 1 ? getStepState(steps[index + 1].id) : 'pending';

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  getCircleClass(state)
                )}
                title={step.label}
              >
                {getIcon(state) || <span className="text-xs font-bold">{step.id}</span>}
              </div>
              {index < steps.length - 1 && (
                <div className={cn('w-12 h-1 transition-all duration-300', getLineClass(state, nextState))} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full view
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const nextState = index < steps.length - 1 ? getStepState(steps[index + 1].id) : 'pending';

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background',
                    getCircleClass(state)
                  )}
                >
                  {getIcon(state) || <span className="text-sm md:text-lg font-bold">{step.id}</span>}
                </div>
                <p
                  className={cn(
                    'mt-2 text-xs md:text-sm font-medium whitespace-nowrap',
                    state === 'complete' && 'text-green-600',
                    state === 'active' && 'text-yellow-600',
                    state === 'error' && 'text-red-600',
                    state === 'pending' && 'text-gray-500'
                  )}
                >
                  {step.label}
                </p>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn('flex-1 h-1 mx-2 md:mx-4 mb-6 transition-all duration-300', getLineClass(state, nextState))} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;