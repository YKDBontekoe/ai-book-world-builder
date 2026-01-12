"use client";

import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { DataPart } from "@/lib/types";

type DataStreamValue = DataPart[];
type SetDataStreamValue = React.Dispatch<React.SetStateAction<DataPart[]>>;

const DataStreamValueContext = createContext<DataStreamValue | null>(null);
const SetDataStreamContext = createContext<SetDataStreamValue | null>(null);

export function DataStreamProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [dataStream, setDataStream] = useState<DataPart[]>([]);

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
	return useMemo(() => ({ dataStream, setDataStream }), [dataStream, setDataStream]);
}

export function useDataStreamValue() {
	const context = useContext(DataStreamValueContext);
	if (context === null) {
		throw new Error(
			"useDataStreamValue must be used within a DataStreamProvider",
		);
	}
	return useMemo(() => ({ dataStream: context }), [context]);
}

export function useSetDataStream() {
	const context = useContext(SetDataStreamContext);
	if (context === null) {
		throw new Error(
			"useSetDataStream must be used within a DataStreamProvider",
		);
	}
	return useMemo(() => ({ setDataStream: context }), [context]);
}
