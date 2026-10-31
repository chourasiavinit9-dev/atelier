'use client';
import { X } from 'lucide-react';

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  'aria-pressed'?: boolean;
  'data-testid'?: string;
}

/**
 * A button that shows a × cancel icon when active, so users
 * can always see which filter is selected and click to deselect it.
 */
export default function ToggleButton({
  active,
  onClick,
  children,
  style,
  'aria-pressed': ariaPressed,
  'data-testid': testId,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      data-testid={testId}
      className={active ? 'btn btn-lime' : 'btn-outline'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        ...style,
      }}
    >
      {children}
      {active && (
        <X
          size={12}
          aria-hidden="true"
          style={{
            marginLeft: 2,
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
}

