/**
 * @fileoverview Constants for the generation wizard.
 */

/**
 * Approximate number of words per page, used for estimation.
 * @type {number}
 */
export const WORDS_PER_PAGE = 250;

/**
 * Base time in minutes to generate a single chapter, used for time estimation.
 * @type {number}
 */
export const ESTIMATION_BASE_MIN_PER_CHAPTER = 2;

/**
 * Multiplier for revision time. Each revision round adds this fraction of the base time.
 * @type {number}
 */
export const ESTIMATION_REVISION_MULTIPLIER_PER_ROUND = 0.5;

/**
 * Approximate number of tokens per chapter, used for cost estimation.
 * @type {number}
 */
export const ESTIMATION_TOKENS_PER_CHAPTER = 15000;

/**
 * Multiplier for token usage during revision. Each revision round adds this fraction of the base tokens.
 * @type {number}
 */
export const ESTIMATION_TOKENS_REVISION_MULTIPLIER = 0.3;

/**
 * Cost in USD per one million tokens, used for cost estimation.
 * @type {number}
 */
export const ESTIMATION_COST_PER_MILLION_TOKENS = 3;
