import { validatePasswordStrength } from '@/utils/passwordValidation';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const strengthColors = [
  'bg-destructive',
  'bg-destructive',
  'bg-warning',
  'bg-success',
  'bg-success',
];

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, suggestions } = validatePasswordStrength(password);
  const percentage = (score / 4) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={`font-medium ${score >= 3 ? 'text-success' : score >= 2 ? 'text-warning' : 'text-destructive'}`}>
          {strengthLabels[score]}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strengthColors[score]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {suggestions.length > 0 && score < 3 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {suggestions.slice(0, 2).map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
