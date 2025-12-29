// types/global.d.ts

interface NavigatorUAData {
	readonly brands: { brand: string; version: string }[];
	readonly mobile: boolean;
	readonly platform: string;
}

interface Navigator extends NavigatorUAData {
	readonly userAgentData?: NavigatorUAData;
}
