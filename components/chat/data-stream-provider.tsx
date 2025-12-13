"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useState } from "react";
import type { CustomUIDataTypes } from "@/lib/types";

type DataStreamValue = DataUIPart<CustomUIDataTypes>[];
type SetDataStreamValue = React.Dispatch<
	React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>
>;

const DataStreamValueContext = createContext<DataStreamValue | null>(null);
const SetDataStreamContext = createContext<SetDataStreamValue | null>(null);

export function DataStreamProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>(
		[],
	);

	return (
		<DataStreamValueContext.Provider value={dataStream}>
			<SetDataStreamContext.Provider value={setDataStream}>
				{children}
			</SetDataStreamContext.Provider>
		</DataStreamValueContext.Provider>
	);
}

export function useDataStream() {
	const dataStream = useContext(DataStreamValueContext);
	const setDataStream = useContext(SetDataStreamContext);

	if (dataStream === null || setDataStream === null) {
		throw new Error("useDataStream must be used within a DataStreamProvider");
	}
	return { dataStream, setDataStream };
}

export function useDataStreamValue() {
	const context = useContext(DataStreamValueContext);
	if (context === null) {
		throw new Error(
			"useDataStreamValue must be used within a DataStreamProvider",
		);
	}
	return { dataStream: context };
}

export function useSetDataStream() {
	const context = useContext(SetDataStreamContext);
	if (context === null) {
		throw new Error(
			"useSetDataStream must be used within a DataStreamProvider",
		);
	}
	return { setDataStream: context };
}
