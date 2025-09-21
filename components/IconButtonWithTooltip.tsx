"use client";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

type Props = {
  label: string; // tooltip text (2-3 words ideal) and aria-label
  children: React.ReactNode; // typically an icon
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
} & Omit<React.ComponentProps<typeof Button>, "children" | "aria-label" | "title"> &
  VariantProps<typeof buttonVariants>;

export default function IconButtonWithTooltip({ label, children, onClick, disabled, className, variant = "ghost", size = "icon", ...rest }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          aria-label={label}
          className={className}
          onClick={onClick}
          disabled={disabled}
          {...rest}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
