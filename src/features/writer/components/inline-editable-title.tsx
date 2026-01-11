"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface InlineEditableTitleProps {
	readonly value: string;
	readonly onSave: (newValue: string) => Promise<boolean>;
	readonly onCancel?: () => void;
	readonly className?: string;
	readonly placeholder?: string;
	readonly maxLength?: number;
	readonly disabled?: boolean;
}

export function InlineEditableTitle({
	value,
	onSave,
	onCancel,
	className,
	placeholder = "Enter title...",
	maxLength = 200,
	disabled = false,
}: InlineEditableTitleProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);
	const [isSaving, setIsSaving] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	useEffect(() => {
		setEditValue(value);
	}, [value]);

	const handleStartEdit = () => {
		if (disabled) return;
		setIsEditing(true);
		setEditValue(value);
	};

	const handleSave = async () => {
		const trimmed = editValue.trim();
		if (!trimmed || trimmed === value) {
			setIsEditing(false);
			return;
		}

		setIsSaving(true);
		const success = await onSave(trimmed);
		setIsSaving(false);

		if (success) {
			setIsEditing(false);
		}
	};

	const handleCancel = () => {
		setEditValue(value);
		setIsEditing(false);
		onCancel?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	if (isEditing) {
		return (
			<div className={cn("flex items-center gap-1 flex-1", className)}>
				<Input
					ref={inputRef}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					maxLength={maxLength}
					disabled={isSaving}
					className="h-7 text-sm px-2 py-1"
				/>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 shrink-0"
					onClick={handleSave}
					disabled={isSaving}
				>
					<Check className="h-3 w-3" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 shrink-0"
					onClick={handleCancel}
					disabled={isSaving}
				>
					<X className="h-3 w-3" />
				</Button>
			</div>
		);
	}

	return (
		<button
			type="button"
			className={cn(
				"truncate cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left w-full outline-none focus:ring-0",
				disabled && "cursor-default hover:opacity-100",
				className,
			)}
			onDoubleClick={handleStartEdit}
			disabled={disabled}
			title={disabled ? undefined : "Double-click to edit"}
			aria-label={disabled ? value : `Edit ${value}. Double-click to edit`}
		>
			{value}
		</button>
	);
}
