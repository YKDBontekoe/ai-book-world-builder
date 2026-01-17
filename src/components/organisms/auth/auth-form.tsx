import Form from "next/form";

import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

export function AuthForm({
	action,
	children,
	defaultEmail = "",
	onEmailChange,
}: {
	action: NonNullable<
		string | ((formData: FormData) => void | Promise<void>) | undefined
	>;
	children: React.ReactNode;
	defaultEmail?: string;
	onEmailChange?: (value: string) => void;
}) {
	return (
		<Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
			<div className="flex flex-col gap-2">
				<Label
					className="font-normal text-zinc-600 dark:text-zinc-400"
					htmlFor="email"
				>
					Email Address
				</Label>

				<Input
					autoComplete="email"
					autoFocus
					className="bg-muted text-md md:text-sm"
					defaultValue={defaultEmail}
					id="email"
					name="email"
					onChange={(event) => onEmailChange?.(event.target.value)}
					placeholder="user@acme.com"
					required
					type="email"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label
					className="font-normal text-zinc-600 dark:text-zinc-400"
					htmlFor="password"
				>
					Password
				</Label>

				<Input
					className="bg-muted text-md md:text-sm"
					id="password"
					name="password"
					required
					type="password"
				/>
			</div>

			{children}
		</Form>
	);
}
