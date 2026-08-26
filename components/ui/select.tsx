'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-11 min-h-[44px] w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-normal text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

export type SelectThemeColor =
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'teal'
  | 'rose'
  | 'slate'
  | 'default';

export const SELECT_THEME_ITEM_CLASSES: Record<
  string,
  { focus: string; indicator: string }
> = {
  emerald: {
    focus:
      'focus:bg-emerald-500/10 focus:text-emerald-950 dark:focus:bg-emerald-950/40 dark:focus:text-emerald-200',
    indicator: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    focus:
      'focus:bg-sky-500/10 focus:text-sky-950 dark:focus:bg-sky-950/40 dark:focus:text-sky-200',
    indicator: 'text-sky-600 dark:text-sky-400',
  },
  amber: {
    focus:
      'focus:bg-amber-500/10 focus:text-amber-950 dark:focus:bg-amber-950/40 dark:focus:text-amber-200',
    indicator: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    focus:
      'focus:bg-blue-500/10 focus:text-blue-950 dark:focus:bg-blue-950/40 dark:focus:text-blue-200',
    indicator: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    focus:
      'focus:bg-purple-500/10 focus:text-purple-950 dark:focus:bg-purple-950/40 dark:focus:text-purple-200',
    indicator: 'text-purple-600 dark:text-purple-400',
  },
  teal: {
    focus:
      'focus:bg-teal-500/10 focus:text-teal-950 dark:focus:bg-teal-950/40 dark:focus:text-teal-200',
    indicator: 'text-teal-600 dark:text-teal-400',
  },
  rose: {
    focus:
      'focus:bg-rose-500/10 focus:text-rose-950 dark:focus:bg-rose-950/40 dark:focus:text-rose-200',
    indicator: 'text-rose-600 dark:text-rose-400',
  },
  slate: {
    focus:
      'focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-100',
    indicator: 'text-slate-700 dark:text-slate-300',
  },
  default: {
    focus:
      'focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20 dark:focus:text-primary',
    indicator: 'text-primary',
  },
};

const SelectThemeContext = React.createContext<string>('default');

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    themeColor?: string;
  }
>(({ className, children, position = 'popper', themeColor, ...props }, ref) => {
  const inheritedTheme = React.useContext(SelectThemeContext);
  const activeTheme = themeColor || inheritedTheme || 'default';

  return (
    <SelectThemeContext.Provider value={activeTheme}>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg backdrop-blur-md dark:border-border dark:bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            position === 'popper' &&
              'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
          position={position}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              'p-1.5',
              position === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectThemeContext.Provider>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2.5 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    themeColor?: string;
  }
>(({ className, children, themeColor, ...props }, ref) => {
  const contextTheme = React.useContext(SelectThemeContext);
  const activeTheme = themeColor || contextTheme || 'default';
  const itemStyle =
    SELECT_THEME_ITEM_CLASSES[activeTheme] || SELECT_THEME_ITEM_CLASSES.default;

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-7 pr-2.5 text-xs font-normal outline-none transition-colors leading-snug focus:font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        itemStyle.focus,
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className={cn('h-3.5 w-3.5 font-bold', itemStyle.indicator)} />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
