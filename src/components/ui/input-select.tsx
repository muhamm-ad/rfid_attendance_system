import * as React from "react";
import { SelectOption, SetState } from "@/types";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn-utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface InputSelectProvided {
  options: SelectOption[];
  onValueChange?: (v: string) => void;
  placeholder: string;
  clearable: boolean;
  disabled: boolean;
  selectedValue: string;
  setSelectedValue: SetState<string>;
  isPopoverOpen: boolean;
  setIsPopoverOpen: SetState<boolean>;
  onOptionSelect: (v: string) => void;
  onClearAllOptions: () => void;
}

export const InputSelect: React.FC<{
  options: SelectOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  onOpenChange?: (open: boolean) => void;
  renderOption?: (option: SelectOption) => React.ReactNode;
  /**
   * When provided, the internal CommandInput search bar is hidden.
   * Use this when the search field is already rendered externally (e.g. the trigger itself).
   * The options you pass should already be pre-filtered based on this value.
   */
  searchValue?: string;
  /**
   * Called when the user types in the internal search bar.
   * Only relevant when `searchValue` is NOT provided (i.e. internal search mode).
   */
  onSearchChange?: (v: string) => void;
  children: (v: InputSelectProvided) => React.ReactNode;
}> = ({
  options,
  value = "",
  onValueChange,
  placeholder = "Select...",
  clearable = false,
  disabled = false,
  className,
  contentClassName,
  onOpenChange,
  renderOption,
  searchValue,
  onSearchChange,
  children,
  ...restProps
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>(value);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Whether the search is controlled externally
  const isSearchExternal = searchValue !== undefined;

  const handleOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    onOpenChange?.(open);
  };

  const onOptionSelect = (option: string) => {
    setSelectedValue(option);
    onValueChange?.(option);
    setIsPopoverOpen(false);
  };

  const onClearAllOptions = () => {
    setSelectedValue("");
    onValueChange?.("");
    setIsPopoverOpen(false);
  };

  React.useEffect(() => {
    if (isPopoverOpen && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [isPopoverOpen]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children({
          options,
          onValueChange,
          placeholder,
          clearable,
          disabled,
          selectedValue,
          setSelectedValue,
          isPopoverOpen,
          setIsPopoverOpen,
          onOptionSelect,
          onClearAllOptions,
        })}
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-auto p-0", className, contentClassName)}
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
        {...restProps}
      >
        {/*
          We pass `shouldFilter={false}` when search is external because
          the parent already filters the options list. When internal, cmdk
          handles filtering natively via CommandInput.
        */}
        <Command shouldFilter={!isSearchExternal}>
          {/* Only render the internal search bar when search is NOT externalized */}
          {!isSearchExternal && (
            <CommandInput
              placeholder="Search..."
              onValueChange={onSearchChange}
            />
          )}
          <CommandList className="max-h-[unset] overflow-y-hidden">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-80 min-h-40 overflow-y-auto">
              {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => onOptionSelect(option.value)}
                    className={cn(
                      "cursor-pointer",
                      renderOption && "p-2 px-3 w-full",
                    )}
                  >
                    <div
                      className={cn(
                        "mr-1 flex h-4 w-4 shrink-0 items-center justify-center",
                        isSelected ? "text-primary" : "invisible",
                      )}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </div>
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <>
                        {option.icon && (
                          <option.icon className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                        )}
                        <span>{option.label}</span>
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
InputSelect.displayName = "InputSelect";

export const InputSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  InputSelectProvided & {
    className?: string;
    leftIcon?: React.ReactNode;
    children?: (v: SelectOption) => React.ReactNode;
    style?: React.CSSProperties;
  }
>(
  (
    {
      options,
      placeholder,
      clearable,
      disabled,
      selectedValue,
      isPopoverOpen,
      setIsPopoverOpen,
      onClearAllOptions,
      className,
      leftIcon,
      style,
      children,
    },
    ref,
  ) => {
    const onTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const hasLeftIcon = leftIcon != null;
    const contentPaddingClass = hasLeftIcon ? "pl-10 pr-10" : "px-2";

    return (
      <Button
        ref={ref}
        onClick={onTogglePopover}
        variant="outline"
        type="button"
        disabled={disabled}
        className={cn(
          "relative flex h-9 min-h-9 w-full items-center justify-between [&_svg]:pointer-events-auto",
          "border-input hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50",
          disabled && "[&_svg]:pointer-events-none",
          contentPaddingClass,
          className,
        )}
        style={style}
      >
        {hasLeftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 shrink-0 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        {selectedValue ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center overflow-hidden">
              {[selectedValue].map((val, index) => {
                const option = options.find((o) => o.value === val);
                if (!option) return <div key={`${index}-${val}`} />;
                if (children) {
                  return (
                    <div key={`${index}-${val}`} className="min-w-0 flex-1 truncate">
                      {children(option)}
                    </div>
                  );
                }
                return (
                  <div key={`${index}-${val}`} className="truncate text-foreground">
                    {option?.icon && (
                      <option.icon className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {option?.label}
                  </div>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {selectedValue && clearable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAllOptions();
                  }}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 opacity-50 transition-transform",
                  isPopoverOpen && "rotate-180",
                )}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm text-muted-foreground">{placeholder}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 opacity-50 transition-transform",
                isPopoverOpen && "rotate-180",
              )}
            />
          </div>
        )}
      </Button>
    );
  },
);
InputSelectTrigger.displayName = "InputSelectTrigger";