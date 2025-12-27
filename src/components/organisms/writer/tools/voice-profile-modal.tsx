"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Textarea } from "@/components/atoms/textarea";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { toast } from "sonner";
import {
	getProjectCharactersAction,
	getVoiceProfileAction,
	generateAndSaveVoiceProfileAction,
	checkSceneVoiceConsistencyAction,
} from "@/app/actions/ai-operations";
import type { VoiceProfile } from "@/lib/db/schema";
import type {
	VoiceConsistencyResult,
	VoiceIssue,
} from "@/lib/ai/services/voice-profile-service";
import { Loader2, AlertCircle, CheckCircle, Ear } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { ScrollArea } from "@/components/atoms/scroll-area";

interface VoiceProfileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function VoiceProfileModal({ open, onOpenChange }: VoiceProfileModalProps) {
	const { project, activeSceneId } = useWriterContext();
	const [characters, setCharacters] = useState<{ id: string; name: string }[]>(
		[],
	);
	const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
	const [profile, setProfile] = useState<VoiceProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [samples, setSamples] = useState("");
	const [consistencyResult, setConsistencyResult] =
		useState<VoiceConsistencyResult | null>(null);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		if (open && project?.id) {
			loadCharacters();
		}
	}, [open, project?.id]);

	useEffect(() => {
		if (selectedCharId) {
			loadProfile(selectedCharId);
			setConsistencyResult(null); // Reset check result
		} else {
			setProfile(null);
		}
	}, [selectedCharId]);

	const loadCharacters = async () => {
		if (!project?.id) return;
		const res = await getProjectCharactersAction(project.id);
		if (res.success && res.characters) {
			setCharacters(res.characters);
		} else {
			toast.error("Failed to load characters");
		}
	};

	const loadProfile = async (charId: string) => {
		setLoading(true);
		const res = await getVoiceProfileAction(charId);
		setLoading(false);
		if (res.success) {
			setProfile(res.profile || null); // profile might be null if not found
		} else {
			toast.error("Failed to load voice profile");
		}
	};

	const handleGenerate = async () => {
		if (!selectedCharId || !samples.trim()) return;
		
		const char = characters.find(c => c.id === selectedCharId);
		if (!char) return;

		setGenerating(true);
		
		// Split samples by newline
		const sampleList = samples.split('\n').filter(s => s.trim().length > 0);

		const res = await generateAndSaveVoiceProfileAction(selectedCharId, char.name, sampleList);
		setGenerating(false);

		if (res.success && res.profile) {
			setProfile(res.profile);
			setSamples(""); // Clear input
			toast.success("Voice profile generated successfully!");
		} else {
			toast.error(res.error || "Failed to generate profile");
		}
	};

	const handleCheckConsistency = async () => {
		if (!selectedCharId || !activeSceneId || !profile) return;

		setChecking(true);
		const res = await checkSceneVoiceConsistencyAction(activeSceneId, selectedCharId);
		setChecking(false);

		if (res.success && res.result) {
			setConsistencyResult(res.result);
			toast.success("Consistency check complete");
		} else {
			toast.error(res.error || "Failed to check consistency");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Ear className="w-5 h-5 text-indigo-400" />
						Voice Profile Manager
					</DialogTitle>
					<DialogDescription>
						Manage character voices and check dialogue consistency.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-4 items-center mb-4">
					<label className="text-sm font-medium whitespace-nowrap">Select Character:</label>
					<Select value={selectedCharId || undefined} onValueChange={setSelectedCharId}>
						<SelectTrigger className="w-[250px]">
							<SelectValue placeholder="Choose a character..." />
						</SelectTrigger>
						<SelectContent>
							{characters.map((char) => (
								<SelectItem key={char.id} value={char.id}>
									{char.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex-1 min-h-0">
					{selectedCharId ? (
						loading ? (
							<div className="flex items-center justify-center h-full">
								<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
							</div>
						) : profile ? (
							<Tabs defaultValue="details" className="h-full flex flex-col">
								<TabsList>
									<TabsTrigger value="details">Profile Details</TabsTrigger>
									<TabsTrigger value="consistency">Consistency Check</TabsTrigger>
								</TabsList>

								<TabsContent value="details" className="flex-1 mt-4 overflow-hidden">
									<ScrollArea className="h-full pr-4">
										<div className="space-y-6">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1">
													<div className="text-sm text-muted-foreground">Vocabulary</div>
													<div className="font-medium capitalize">{profile.vocabularyLevel}</div>
												</div>
												<div className="space-y-1">
													<div className="text-sm text-muted-foreground">Sentence Style</div>
													<div className="font-medium capitalize">{profile.sentenceStyle.replaceAll('_', ' ')}</div>
												</div>
												<div className="space-y-1">
													<div className="text-sm text-muted-foreground">Avg. Length</div>
													<div className="font-medium">{profile.averageSentenceLength} words</div>
												</div>
												<div className="space-y-1">
													<div className="text-sm text-muted-foreground">Tone</div>
													<div className="font-medium capitalize">{profile.defaultTone}</div>
												</div>
											</div>

											<div className="space-y-2">
												<div className="text-sm font-medium">Catchphrases</div>
												<div className="flex flex-wrap gap-2">
													{profile.catchphrases.length > 0 ? (
														profile.catchphrases.map((phrase, i) => (
															<Badge key={i} variant="secondary">{phrase}</Badge>
														))
													) : (
														<span className="text-muted-foreground text-sm">None</span>
													)}
												</div>
											</div>

											<div className="space-y-2">
												<div className="text-sm font-medium">Speech Mannerisms</div>
												{profile.speechMannerisms.length > 0 ? (
													<ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
														{profile.speechMannerisms.map((m, i) => (
															<li key={i}>{m}</li>
														))}
													</ul>
												) : (
													<span className="text-muted-foreground text-sm">None</span>
												)}
											</div>
										</div>
									</ScrollArea>
								</TabsContent>

								<TabsContent value="consistency" className="flex-1 mt-4 flex flex-col min-h-0">
									<div className="mb-4">
										<p className="text-sm text-muted-foreground mb-4">
											Analyze the currently active scene for dialogue that aligns with this voice profile.
										</p>
										<Button 
											onClick={handleCheckConsistency} 
											disabled={checking || !activeSceneId}
											className="w-full sm:w-auto"
										>
											{checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
											Check Current Scene
										</Button>
									</div>

									{consistencyResult && (
										<ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/20">
											<div className="space-y-4">
												<div className="flex items-center gap-2">
													<div className="text-lg font-semibold">
														Score: {consistencyResult.score}/100
													</div>
													{consistencyResult.isConsistent ? (
														<Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Consistent</Badge>
													) : (
														<Badge variant="destructive">Needs Improvement</Badge>
													)}
												</div>

												{consistencyResult.issues.length === 0 ? (
													<div className="flex items-center gap-2 text-green-600">
														<CheckCircle className="w-4 h-4" />
														<span>No issues found!</span>
													</div>
												) : (
													<div className="space-y-3">
														{consistencyResult.issues.map(
															(issue: VoiceIssue, i: number) => (
																<div
																	key={i}
																	className="p-3 border rounded bg-background"
																>
																	<div className="flex items-center gap-2 mb-1">
																		<AlertCircle className="w-4 h-4 text-amber-500" />
																	<span className="font-medium text-sm capitalize">{issue.type.replace('_', ' ')}</span>
																	<Badge variant="outline" className="text-xs h-5">{issue.severity}</Badge>
																</div>
																<p className="text-sm text-muted-foreground italic mb-2">"{issue.dialogueLine}"</p>
																<p className="text-sm">{issue.explanation}</p>
																{consistencyResult.suggestions[i] && (
																	<div className="mt-2 text-sm bg-muted p-2 rounded">
																		<span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Suggestion: </span>
																		<span className="text-foreground">{consistencyResult.suggestions[i].rewritten}</span>
																	</div>
																)}
															</div>
														))}
													</div>
												)}
											</div>
										</ScrollArea>
									)}
								</TabsContent>
							</Tabs>
						) : (
							<div className="space-y-4 pt-4">
								<div className="p-4 border rounded-lg bg-muted/20 text-center">
									<p className="mb-2 font-medium">No voice profile found</p>
									<p className="text-sm text-muted-foreground mb-4">
										Generate a profile by providing sample dialogue for this character.
									</p>
								</div>
								
								<div className="space-y-2">
									<label className="text-sm font-medium">Dialogue Samples (one per line):</label>
									<Textarea 
										value={samples} 
										onChange={(e) => setSamples(e.target.value)}
										placeholder={
											"\"I don't think that's a good idea.\"\n" +
											"\"Leave me alone!\"\n" +
											"\"Perhaps we should reconsider our options.\""
										}
										className="h-40 font-mono text-sm"
									/>
									<p className="text-xs text-muted-foreground">Provide at least 3-5 samples for best results.</p>
								</div>

								<Button 
									onClick={handleGenerate} 
									disabled={generating || !samples.trim()}
									className="w-full"
								>
									{generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
									Generate Profile
								</Button>
							</div>
						)
					) : (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground">
							<p>Select a character to manage their voice profile.</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
