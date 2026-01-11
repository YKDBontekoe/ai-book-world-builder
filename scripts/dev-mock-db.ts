import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sqlitePath = process.env.SQLITE_DB_PATH ?? ".local/dev.sqlite";
const shouldReset = process.argv.includes("--reset");

const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER,
  image TEXT,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  bannedAt INTEGER
);

CREATE TABLE IF NOT EXISTS UserPreferences (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  favoriteModels TEXT NOT NULL DEFAULT '[]',
  recentModels TEXT NOT NULL DEFAULT '[]',
  modelPreferences TEXT DEFAULT '{"light":null,"middle":null,"large":null}',
  appearancePreferences TEXT DEFAULT '{"theme":"violet","editorFont":"sans","editorFontSize":16,"editorLineHeight":1.6}',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Account (
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, providerAccountId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Project (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  folders TEXT NOT NULL,
  userId TEXT NOT NULL,
  forkedFromId TEXT,
  lastViewedSceneId TEXT,
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Document (
  id TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  text TEXT NOT NULL DEFAULT 'text',
  userId TEXT NOT NULL,
  PRIMARY KEY (id, createdAt),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Suggestion (
  id TEXT NOT NULL,
  documentId TEXT NOT NULL,
  documentCreatedAt INTEGER NOT NULL,
  originalText TEXT NOT NULL,
  suggestedText TEXT NOT NULL,
  description TEXT,
  isResolved INTEGER NOT NULL DEFAULT 0,
  userId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (documentId, documentCreatedAt) REFERENCES Document(id, createdAt)
);

CREATE TABLE IF NOT EXISTS Chat (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  userId TEXT NOT NULL,
  projectId TEXT,
  visibility TEXT NOT NULL DEFAULT 'private',
  lastContext TEXT,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Message_v2 (
  id TEXT PRIMARY KEY,
  chatId TEXT NOT NULL,
  role TEXT NOT NULL,
  parts TEXT NOT NULL,
  attachments TEXT NOT NULL,
  usage TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (chatId) REFERENCES Chat(id)
);

CREATE TABLE IF NOT EXISTS Vote_v2 (
  chatId TEXT NOT NULL,
  messageId TEXT NOT NULL,
  isUpvoted INTEGER NOT NULL,
  PRIMARY KEY (chatId, messageId),
  FOREIGN KEY (chatId) REFERENCES Chat(id),
  FOREIGN KEY (messageId) REFERENCES Message_v2(id)
);

CREATE TABLE IF NOT EXISTS Stream (
  id TEXT PRIMARY KEY,
  chatId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (chatId) REFERENCES Chat(id)
);

CREATE TABLE IF NOT EXISTS Outline (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  pov TEXT NOT NULL,
  tone TEXT NOT NULL,
  pacing TEXT NOT NULL,
  beats TEXT,
  projectId TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Volume (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  outlineId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (outlineId) REFERENCES Outline(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Chapter (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  sequence INTEGER NOT NULL,
  outlineId TEXT NOT NULL,
  volumeId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (outlineId) REFERENCES Outline(id),
  FOREIGN KEY (volumeId) REFERENCES Volume(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS ChapterDraft (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  content TEXT NOT NULL,
  chapterId TEXT NOT NULL,
  volumeId TEXT NOT NULL,
  outlineId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (chapterId) REFERENCES Chapter(id),
  FOREIGN KEY (volumeId) REFERENCES Volume(id),
  FOREIGN KEY (outlineId) REFERENCES Outline(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Scene (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  content TEXT,
  wordCount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned',
  prevSceneId TEXT,
  chapterId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (chapterId) REFERENCES Chapter(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS SceneCard (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  setting TEXT,
  atmosphere TEXT,
  emotionalBeats TEXT,
  characterGoals TEXT,
  constraints TEXT,
  plannedReveal TEXT,
  chronologicalSequence INTEGER,
  timeSetting TEXT,
  sceneId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (sceneId) REFERENCES Scene(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Entity (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  summary TEXT,
  startDate INTEGER,
  endDate INTEGER,
  projectId TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS EntityAttribute (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  dataType TEXT NOT NULL,
  startDate INTEGER,
  endDate INTEGER,
  entityId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (entityId) REFERENCES Entity(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS Relationship (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  startDate INTEGER,
  endDate INTEGER,
  projectId TEXT NOT NULL,
  sourceEntityId TEXT NOT NULL,
  targetEntityId TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (sourceEntityId) REFERENCES Entity(id),
  FOREIGN KEY (targetEntityId) REFERENCES Entity(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  meta TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt INTEGER NOT NULL,
  processedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS BookGeneration (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  settings TEXT,
  canvasState TEXT,
  taskLog TEXT,
  error TEXT,
  pausedAt INTEGER,
  currentStepId TEXT,
  totalSteps INTEGER,
  completedSteps INTEGER DEFAULT 0,
  estimatedCost TEXT,
  startedAt INTEGER,
  completedAt INTEGER,
  outlineId TEXT,
  templateId TEXT,
  projectId TEXT NOT NULL,
  FOREIGN KEY (outlineId) REFERENCES Outline(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS StoryState (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  chapterNumber INTEGER NOT NULL,
  characterKnowledge TEXT,
  characterInjuries TEXT,
  relationshipChanges TEXT,
  openThreads TEXT,
  revealsMade TEXT,
  worldStateChanges TEXT,
  generationId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  FOREIGN KEY (generationId) REFERENCES BookGeneration(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS BookExport (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  projectId TEXT NOT NULL,
  blobUrl TEXT,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  userId TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS BookGenerationStep (
  id TEXT PRIMARY KEY,
  generationId TEXT NOT NULL,
  chapterId TEXT,
  sequence INTEGER NOT NULL,
  stepType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  revisionRound INTEGER DEFAULT 1,
  agentOutput TEXT,
  reviewFeedback TEXT,
  wordCount INTEGER,
  tokenCount INTEGER,
  usage TEXT,
  startedAt INTEGER,
  completedAt INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (generationId) REFERENCES BookGeneration(id),
  FOREIGN KEY (chapterId) REFERENCES Chapter(id)
);

CREATE TABLE IF NOT EXISTS BookGenerationAsset (
  id TEXT PRIMARY KEY,
  generationId TEXT NOT NULL,
  assetType TEXT NOT NULL,
  content TEXT,
  imageUrl TEXT,
  metadata TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (generationId) REFERENCES BookGeneration(id)
);

CREATE TABLE IF NOT EXISTS GenerationTemplate (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  settings TEXT NOT NULL,
  isBuiltIn INTEGER NOT NULL DEFAULT 0,
  userId TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS ChapterVersion (
  id TEXT PRIMARY KEY,
  chapterId TEXT NOT NULL,
  generationId TEXT,
  content TEXT NOT NULL,
  wordCount INTEGER,
  version INTEGER NOT NULL,
  createdBy TEXT DEFAULT 'ai',
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (chapterId) REFERENCES Chapter(id),
  FOREIGN KEY (generationId) REFERENCES BookGeneration(id)
);

CREATE TABLE IF NOT EXISTS GenerationNote (
  id TEXT PRIMARY KEY,
  generationId TEXT NOT NULL,
  chapterId TEXT,
  content TEXT NOT NULL,
  isGlobal INTEGER NOT NULL DEFAULT 0,
  appliedAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (generationId) REFERENCES BookGeneration(id),
  FOREIGN KEY (chapterId) REFERENCES Chapter(id)
);

CREATE TABLE IF NOT EXISTS ReadingProgress (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  chapterId TEXT NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (chapterId) REFERENCES Chapter(id)
);

CREATE TABLE IF NOT EXISTS SourceMaterial (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  filename TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  blobUrl TEXT,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS SourceMaterialProcessing (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  nextAttemptAt INTEGER NOT NULL,
  lastError TEXT,
  startedAt INTEGER,
  completedAt INTEGER,
  bytesProcessed INTEGER NOT NULL DEFAULT 0,
  chapters INTEGER NOT NULL DEFAULT 0,
  chunks INTEGER NOT NULL DEFAULT 0,
  normalizedCharacters INTEGER NOT NULL DEFAULT 0,
  durationMs INTEGER NOT NULL DEFAULT 0,
  metadata TEXT,
  sourceMaterialId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  FOREIGN KEY (sourceMaterialId) REFERENCES SourceMaterial(id),
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS SourceMaterialChapter (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  title TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  headings TEXT NOT NULL,
  metadata TEXT,
  sourceMaterialId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  FOREIGN KEY (sourceMaterialId) REFERENCES SourceMaterial(id),
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS SourceMaterialChunk (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  text TEXT NOT NULL,
  metadata TEXT,
  chapterId TEXT NOT NULL,
  sourceMaterialId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  userId TEXT NOT NULL,
  FOREIGN KEY (chapterId) REFERENCES SourceMaterialChapter(id),
  FOREIGN KEY (sourceMaterialId) REFERENCES SourceMaterial(id),
  FOREIGN KEY (projectId) REFERENCES Project(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS ConsistencyIssue (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  sceneId TEXT,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  suggestion TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
  FOREIGN KEY (sceneId) REFERENCES Scene(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS project_user_idx ON Project(userId);
CREATE INDEX IF NOT EXISTS document_user_idx ON Document(userId);
CREATE INDEX IF NOT EXISTS chat_user_id_created_at_idx ON Chat(userId, createdAt);
CREATE INDEX IF NOT EXISTS chat_project_id_idx ON Chat(projectId);
CREATE INDEX IF NOT EXISTS message_chat_id_created_at_idx ON Message_v2(chatId, createdAt);
CREATE INDEX IF NOT EXISTS scene_prev_scene_idx ON Scene(prevSceneId);
CREATE INDEX IF NOT EXISTS scene_chapter_idx ON Scene(chapterId);
CREATE INDEX IF NOT EXISTS scene_project_idx ON Scene(projectId);
CREATE UNIQUE INDEX IF NOT EXISTS entity_name_project_idx ON Entity(projectId, name);
CREATE UNIQUE INDEX IF NOT EXISTS entity_attribute_name_idx ON EntityAttribute(entityId, name);
CREATE UNIQUE INDEX IF NOT EXISTS relationship_unique_idx ON Relationship(projectId, sourceEntityId, targetEntityId, type);
CREATE INDEX IF NOT EXISTS source_material_project_idx ON SourceMaterial(projectId);
CREATE INDEX IF NOT EXISTS source_material_user_idx ON SourceMaterial(userId);
CREATE INDEX IF NOT EXISTS source_material_chapter_material_idx ON SourceMaterialChapter(sourceMaterialId);
CREATE INDEX IF NOT EXISTS source_material_chapter_project_idx ON SourceMaterialChapter(projectId);
CREATE INDEX IF NOT EXISTS source_material_chunk_chapter_idx ON SourceMaterialChunk(chapterId);
CREATE INDEX IF NOT EXISTS source_material_chunk_project_idx ON SourceMaterialChunk(projectId);
CREATE INDEX IF NOT EXISTS source_material_processing_project_idx ON SourceMaterialProcessing(projectId);
CREATE UNIQUE INDEX IF NOT EXISTS source_material_processing_material_idx ON SourceMaterialProcessing(sourceMaterialId);
CREATE INDEX IF NOT EXISTS issue_project_idx ON ConsistencyIssue(projectId);
CREATE INDEX IF NOT EXISTS issue_scene_idx ON ConsistencyIssue(sceneId);
CREATE UNIQUE INDEX IF NOT EXISTS chapter_sequence_volume_idx ON Chapter(volumeId, sequence);
CREATE UNIQUE INDEX IF NOT EXISTS scene_sequence_chapter_idx ON Scene(chapterId, sequence);
CREATE UNIQUE INDEX IF NOT EXISTS scene_card_scene_idx ON SceneCard(sceneId);
CREATE UNIQUE INDEX IF NOT EXISTS reading_progress_user_project_idx ON ReadingProgress(userId, projectId);
CREATE INDEX IF NOT EXISTS reading_progress_user_idx ON ReadingProgress(userId);
CREATE UNIQUE INDEX IF NOT EXISTS book_generation_project_idx ON BookGeneration(projectId);
CREATE INDEX IF NOT EXISTS story_state_generation_idx ON StoryState(generationId);
CREATE UNIQUE INDEX IF NOT EXISTS story_state_chapter_idx ON StoryState(generationId, chapterNumber);
CREATE INDEX IF NOT EXISTS book_export_project_idx ON BookExport(projectId);
CREATE INDEX IF NOT EXISTS book_export_user_idx ON BookExport(userId);
CREATE INDEX IF NOT EXISTS book_generation_step_generation_idx ON BookGenerationStep(generationId);
CREATE INDEX IF NOT EXISTS book_generation_step_sequence_idx ON BookGenerationStep(generationId, sequence);
CREATE INDEX IF NOT EXISTS book_generation_asset_generation_idx ON BookGenerationAsset(generationId);
CREATE INDEX IF NOT EXISTS book_generation_asset_type_idx ON BookGenerationAsset(generationId, assetType);
CREATE INDEX IF NOT EXISTS generation_template_user_idx ON GenerationTemplate(userId);
CREATE INDEX IF NOT EXISTS chapter_version_chapter_idx ON ChapterVersion(chapterId);
CREATE INDEX IF NOT EXISTS chapter_version_version_idx ON ChapterVersion(chapterId, version);
CREATE INDEX IF NOT EXISTS generation_note_generation_idx ON GenerationNote(generationId);
CREATE INDEX IF NOT EXISTS generation_note_chapter_idx ON GenerationNote(chapterId);
`;

const run = async (): Promise<void> => {
	const [{ default: Database }] = await Promise.all([import("better-sqlite3")]);

	const resolvedPath = resolve(sqlitePath);
	await mkdir(dirname(resolvedPath), { recursive: true });

	if (shouldReset) {
		await rm(resolvedPath, { force: true });
	}

	const client = new Database(resolvedPath);
	client.pragma("journal_mode = WAL");
	client.exec(schemaSql);

	const now = Date.now();
	const userId = crypto.randomUUID();
	const projectId = crypto.randomUUID();
	const outlineId = crypto.randomUUID();
	const volumeId = crypto.randomUUID();
	const chapterId = crypto.randomUUID();
	const sceneId = crypto.randomUUID();

	const insertUser = client.prepare(
		"INSERT OR IGNORE INTO User (id, email, name, role) VALUES (?, ?, ?, ?)",
	);
	insertUser.run(userId, "demo@example.com", "Demo User", "user");

	const insertProject = client.prepare(
		"INSERT OR IGNORE INTO Project (id, createdAt, name, description, visibility, folders, userId) VALUES (?, ?, ?, ?, ?, ?, ?)",
	);
	insertProject.run(
		projectId,
		now,
		"Demo Project",
		"Local SQLite bootstrap",
		"private",
		JSON.stringify([]),
		userId,
	);

	const insertOutline = client.prepare(
		"INSERT OR IGNORE INTO Outline (id, createdAt, updatedAt, title, pov, tone, pacing, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
	);
	insertOutline.run(
		outlineId,
		now,
		now,
		"Demo Outline",
		"Third",
		"Neutral",
		"Moderate",
		projectId,
	);

	const insertVolume = client.prepare(
		"INSERT OR IGNORE INTO Volume (id, createdAt, updatedAt, title, outlineId, projectId) VALUES (?, ?, ?, ?, ?, ?)",
	);
	insertVolume.run(volumeId, now, now, "Volume One", outlineId, projectId);

	const insertChapter = client.prepare(
		"INSERT OR IGNORE INTO Chapter (id, createdAt, updatedAt, title, status, sequence, outlineId, volumeId, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
	);
	insertChapter.run(
		chapterId,
		now,
		now,
		"Chapter One",
		"planned",
		1,
		outlineId,
		volumeId,
		projectId,
	);

	const insertScene = client.prepare(
		"INSERT OR IGNORE INTO Scene (id, createdAt, updatedAt, title, sequence, status, chapterId, projectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
	);
	insertScene.run(
		sceneId,
		now,
		now,
		"Opening Scene",
		1,
		"planned",
		chapterId,
		projectId,
	);

	client.close();

	console.log(`✅ SQLite dev DB ready at ${resolvedPath}`);
};

run().catch((error) => {
	console.error("❌ Failed to bootstrap SQLite DB");
	console.error(error);
	process.exit(1);
});
