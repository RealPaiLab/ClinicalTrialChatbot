import { OICR_LOGO } from '@/assets/oicr-logo';
import { cn } from '@/lib/utils';

interface OicrLogoProps {
  className?: string;
}

/** OICR logo whose ink follows `currentColor`, so it flips with the theme. */
function OicrLogo({ className }: OicrLogoProps) {
  return (
    <svg
      role="img"
      aria-label="Ontario Institute for Cancer Research"
      viewBox={OICR_LOGO.viewBox}
      className={cn('w-auto shrink-0', className)}
    >
      <path d={OICR_LOGO.green} className="fill-highlight" fillRule="evenodd" />
      <path d={OICR_LOGO.ink} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export default OicrLogo;
