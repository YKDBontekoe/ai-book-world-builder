"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import {
	type ComponentProps,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { Carousel, type CarouselApi } from "@/components/atoms/carousel";
import { cn } from "@/lib/utils";

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
	const context = useContext(CarouselApiContext);
	return context;
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

export const InlineCitationCarousel = ({
	className,
	children,
	...props
}: InlineCitationCarouselProps): JSX.Element => {
	const [api, setApi] = useState<CarouselApi>();

	return (
		<CarouselApiContext.Provider value={api}>
			<Carousel className={cn("w-full", className)} setApi={setApi} {...props}>
				{children}
			</Carousel>
		</CarouselApiContext.Provider>
	);
};

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

export const InlineCitationCarouselIndex = ({
	children,
	className,
	...props
}: InlineCitationCarouselIndexProps): JSX.Element => {
	const api = useCarouselApi();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		const onSelect = () => {
			setCurrent(api.selectedScrollSnap() + 1);
		};

		api.on("select", onSelect);

		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	return (
		<div
			className={cn(
				"flex flex-1 items-center justify-end px-3 py-1 text-muted-foreground text-xs",
				className,
			)}
			{...props}
		>
			{children ?? `${current}/${count}`}
		</div>
	);
};

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

export const InlineCitationCarouselPrev = ({
	className,
	...props
}: InlineCitationCarouselPrevProps): JSX.Element => {
	const api = useCarouselApi();

	const handleClick = useCallback(() => {
		if (api) {
			api.scrollPrev();
		}
	}, [api]);

	return (
		<button
			aria-label="Previous"
			className={cn("shrink-0 rounded-lg", className)}
			onClick={handleClick}
			type="button"
			{...props}
		>
			<ArrowLeftIcon className="size-4 text-muted-foreground" />
		</button>
	);
};

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

export const InlineCitationCarouselNext = ({
	className,
	...props
}: InlineCitationCarouselNextProps): JSX.Element => {
	const api = useCarouselApi();

	const handleClick = useCallback(() => {
		if (api) {
			api.scrollNext();
		}
	}, [api]);

	return (
		<button
			aria-label="Next"
			className={cn("shrink-0 rounded-lg", className)}
			onClick={handleClick}
			type="button"
			{...props}
		>
			<ArrowRightIcon className="size-4 text-muted-foreground" />
		</button>
	);
};
