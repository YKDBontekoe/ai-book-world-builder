import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type IconProps = Omit<ComponentPropsWithoutRef<"svg">, "height" | "width"> & {
  size?: number;
  title?: string;
};

interface CreateIconOptions {
  displayName: string;
  viewBox?: string;
  defaultSize?: number;
  children: ReactNode;
  svgProps?: Omit<ComponentPropsWithoutRef<"svg">, "height" | "width" | "viewBox">;
}

/**
 * Builds a standardized SVG icon component with shared sizing, title, and className handling.
 */
export function createIcon({
  displayName,
  viewBox = "0 0 16 16",
  defaultSize = 16,
  children,
  svgProps,
}: CreateIconOptions) {
  const { className: defaultClassName, ...restSvgProps } = svgProps ?? {};

  const Icon = ({ size = defaultSize, title, className, ...rest }: IconProps) => (
    <svg
      aria-hidden={title ? undefined : true}
      role="img"
      width={size}
      height={size}
      viewBox={viewBox}
      className={cn(defaultClassName, className)}
      strokeLinejoin="round"
      {...restSvgProps}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );

  Icon.displayName = displayName;

  return Icon;
}
