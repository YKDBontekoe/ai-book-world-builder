import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
	BookCanvasProvider,
	useBookCanvasActions,
} from "@/components/organisms/book-canvas/book-canvas-context";
import { GeneratorPane } from "@/components/organisms/book-canvas/panes/generator-pane";

const meta: Meta<typeof GeneratorPane> = {
	title: "Organisms/Book Canvas/Generator Pane",
	component: GeneratorPane,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type Story = StoryObj<typeof GeneratorPane>;

function CanvasSetup({ children }: { children: ReactNode }): JSX.Element {
	const { setProjectId } = useBookCanvasActions();

	useEffect(() => {
		setProjectId("storybook-project");
	}, [setProjectId]);

	return <>{children}</>;
}

function GeneratorPaneStoryWrapper(): JSX.Element {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<BookCanvasProvider>
				<CanvasSetup>
					<div className="h-screen w-full bg-background">
						<GeneratorPane />
					</div>
				</CanvasSetup>
			</BookCanvasProvider>
		</QueryClientProvider>
	);
}

export const Default: Story = {
	render: () => <GeneratorPaneStoryWrapper />,
};
