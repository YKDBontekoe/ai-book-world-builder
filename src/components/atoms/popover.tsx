"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
	(
		{ className, align = "center", sideOffset = 4, children, ...props },
		ref,
	) => (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				className="z-50 outline-none"
				{...props}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className={cn(
						"w-72 rounded-lg border glass-panel p-4 text-popover-foreground shadow-md",
						className,
					)}
				>
					{children}
				</motion.div>
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
