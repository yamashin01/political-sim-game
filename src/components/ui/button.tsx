import { cn } from '@/utils/cn';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-display font-bold tracking-wider text-sm uppercase ring-offset-background transition-[transform,box-shadow,background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 rounded-none',
  {
    variants: {
      variant: {
        // Primary — press-block, ink shadow, vermilion fill
        default:
          'press-block bg-vermilion text-paper border border-vermilion-deep hover:bg-vermilion-deep',
        // Destructive — deeper red, kept for parity
        destructive: 'press-block bg-vermilion-deep text-paper border border-ink hover:bg-ink',
        // Outline — ink rule border with paper fill
        outline: 'press-block bg-paper text-ink border border-ink hover:bg-ink hover:text-paper',
        // Secondary — paper-deep field
        secondary: 'bg-paper-deep text-ink border border-ink/40 hover:border-ink hover:bg-paper',
        // Ghost — underlined newsroom link feel
        ghost:
          'bg-transparent text-ink hover:text-vermilion underline decoration-ink/30 hover:decoration-vermilion underline-offset-[6px] decoration-1',
        // Link
        link: 'text-vermilion underline-offset-4 hover:underline lowercase tracking-normal',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';
