import "server-only";

/**
 * Base Repository Interface
 *
 * Provides a standard interface for data access operations.
 * All repositories should extend this base class.
 */

export interface FindOptions {
	limit?: number;
	offset?: number;
	orderBy?: string;
	orderDirection?: "asc" | "desc";
}

/**
 * Base interface for all entities with an ID
 */
export interface Entity {
	id: string;
}

/**
 * Abstract base repository providing common CRUD operations
 */
export abstract class BaseRepository<
	T extends Entity,
	CreateInput = Omit<T, "id">,
	UpdateInput = Partial<T>,
> {
	/**
	 * Find a single record by ID
	 */
	abstract findById(id: string): Promise<T | null>;

	/**
	 * Find all records matching optional criteria
	 */
	abstract findAll(options?: FindOptions): Promise<T[]>;

	/**
	 * Create a new record
	 */
	abstract create(data: CreateInput): Promise<T>;

	/**
	 * Update an existing record by ID
	 */
	abstract update(id: string, data: UpdateInput): Promise<T>;

	/**
	 * Delete a record by ID
	 */
	abstract delete(id: string): Promise<void>;

	/**
	 * Check if a record exists by ID
	 */
	async exists(id: string): Promise<boolean> {
		const record = await this.findById(id);
		return record !== null;
	}

	/**
	 * Find a record by ID or throw NotFoundError
	 */
	async findByIdOrThrow(id: string): Promise<T> {
		const record = await this.findById(id);
		if (!record) {
			const { NotFoundError } = await import("@/lib/errors");
			throw new NotFoundError(`Record not found: ${id}`);
		}
		return record;
	}
}

/**
 * Base repository with transaction support
 */
export abstract class TransactionalRepository<
	T extends Entity,
	CreateInput = Omit<T, "id">,
	UpdateInput = Partial<T>,
> extends BaseRepository<T, CreateInput, UpdateInput> {
	/**
	 * Execute operations within a transaction
	 */
	abstract withTransaction<R>(
		callback: (tx: unknown) => Promise<R>,
	): Promise<R>;
}

/**
 * Repository result type for operations that can fail
 */
export type RepositoryResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };
