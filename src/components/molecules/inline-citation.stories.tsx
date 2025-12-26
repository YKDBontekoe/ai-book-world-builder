import type { Meta, StoryObj } from "@storybook/react";
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselItem,
	InlineCitationCarouselNext,
	InlineCitationCarouselPrev,
	InlineCitationSource,
	InlineCitationText,
} from "@/components/molecules/inline-citation";

const meta: Meta<typeof InlineCitation> = {
	title: "Elements/InlineCitation",
	component: InlineCitation,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof InlineCitation>;

const sources = [
	"https://en.wikipedia.org/wiki/React_(software_library)",
	"https://react.dev",
];

export const Default: Story = {
	render: () => (
		<div className="p-10 text-sm">
			<p>
				React is a free and open-source front-end JavaScript library.
				<InlineCitation>
					<InlineCitationCard>
						<InlineCitationCardTrigger sources={sources} />
						<InlineCitationCardBody>
							<InlineCitationCarousel>
								<InlineCitationCarouselHeader>
									<span className="text-xs font-semibold">Sources</span>
									<div className="flex items-center gap-2">
										<InlineCitationCarouselIndex />
										<div className="flex gap-1">
											<InlineCitationCarouselPrev />
											<InlineCitationCarouselNext />
										</div>
									</div>
								</InlineCitationCarouselHeader>
								<InlineCitationCarouselContent>
									<InlineCitationCarouselItem>
										<InlineCitationSource
											title="React (software library) - Wikipedia"
											url={sources[0]}
											description="React is a free and open-source front-end JavaScript library for building user interfaces based on components."
										/>
									</InlineCitationCarouselItem>
									<InlineCitationCarouselItem>
										<InlineCitationSource
											title="React"
											url={sources[1]}
											description="The library for web and native user interfaces"
										/>
									</InlineCitationCarouselItem>
								</InlineCitationCarouselContent>
							</InlineCitationCarousel>
						</InlineCitationCardBody>
					</InlineCitationCard>
				</InlineCitation>
			</p>
		</div>
	),
};
