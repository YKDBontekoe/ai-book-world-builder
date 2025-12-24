import { unstable_cache as cache } from "next/cache";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { myProvider } from "@/lib/ai/providers";
import { saveMessages, updateChatLastContextById } from "@/lib/db/queries";
import type { AppUsage } from "@/lib/usage";

const getTokenlensCatalog = cache(
	async (): Promise<ModelCatalog | undefined> => {
		try {
			return await fetchModels();
		} catch (err) {
			console.warn(
				"TokenLens: catalog fetch failed, using default catalog",
				err,
			);
			return; // tokenlens helpers will fall back to defaultCatalog
		}
	},
	["tokenlens-catalog"],
	{ revalidate: 24 * 60 * 60 }, // 24 hours
);

export async function enrichUsage({
	usage,
	selectedChatModel,
	isDynamicModel,
}: {
	usage: any;
	selectedChatModel: string;
	isDynamicModel: boolean;
}): Promise<AppUsage> {
	try {
		const providers = await getTokenlensCatalog();
		let modelId = selectedChatModel;

		if (!isDynamicModel) {
			try {
				modelId = myProvider.languageModel(selectedChatModel).modelId;
			} catch (_error) {
				// ignore
			}
		}

		if (!modelId || !providers) {
			return usage as AppUsage;
		}

		const summary = getUsage({ modelId, usage, providers });
		return { ...usage, ...summary, modelId } as AppUsage;
	} catch (err) {
		console.warn("TokenLens enrichment failed", err);
		return usage as AppUsage;
	}
}

export async function persistChat({
	chatId,
	messages,
	finalUsage,
}: {
	chatId: string;
	messages: any[];
	finalUsage?: AppUsage;
}) {
	await saveMessages({
		messages: messages.map((currentMessage) => ({
			id: currentMessage.id,
			role: currentMessage.role,
			parts: currentMessage.parts,
			createdAt: new Date(),
			attachments: [],
			chatId: chatId,
			usage: (currentMessage.role === "assistant" ? finalUsage : null) ?? null,
		})),
	});

	if (finalUsage) {
		try {
			await updateChatLastContextById({
				chatId: chatId,
				context: finalUsage,
			});
		} catch (err) {
			console.warn("Unable to persist last usage for chat", chatId, err);
		}
	}
}
