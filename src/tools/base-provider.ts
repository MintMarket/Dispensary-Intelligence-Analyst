/**
 * Base Tool Provider Implementation
 * Provides foundation for tool implementations with error handling and logging
 */

import {
  ToolProvider,
  SearchCompetitorsArgs,
  SearchCompetitorsResponse,
  FetchEventsArgs,
  FetchEventsResponse,
  GetPlacesRatingsArgs,
  GetPlacesRatingsResponse,
  ListObservationsArgs,
  ListObservationsResponse,
  ListFutureEventsArgs,
  ListFutureEventsResponse,
  GenerateExecSummaryArgs,
  GenerateExecSummaryResponse,
} from '../types';

export abstract class BaseToolProvider implements ToolProvider {
  protected orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
  }

  /**
   * Search for competitor promotions, news, and activities
   */
  abstract searchCompetitors(
    args: SearchCompetitorsArgs
  ): Promise<SearchCompetitorsResponse>;

  /**
   * Fetch upcoming events in a location
   */
  abstract fetchEvents(args: FetchEventsArgs): Promise<FetchEventsResponse>;

  /**
   * Get ratings and review counts for places
   */
  abstract getPlacesRatings(
    args: GetPlacesRatingsArgs
  ): Promise<GetPlacesRatingsResponse>;

  /**
   * List internally stored observations
   */
  abstract listObservations(
    args: ListObservationsArgs
  ): Promise<ListObservationsResponse>;

  /**
   * List internally stored future events
   */
  abstract listFutureEvents(
    args: ListFutureEventsArgs
  ): Promise<ListFutureEventsResponse>;

  /**
   * Generate executive summary (optional server-side orchestration)
   */
  generateExecSummary?(
    args: GenerateExecSummaryArgs
  ): Promise<GenerateExecSummaryResponse>;

  /**
   * Validate arguments and apply defaults
   */
  protected validateAndApplyDefaults<T extends Record<string, any>>(
    args: T,
    defaults: Partial<T>
  ): T {
    return { ...defaults, ...args } as T;
  }

  /**
   * Log tool invocation (can be overridden for custom logging)
   */
  protected log(tool: string, args: any): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[${new Date().toISOString()}] ${tool}:`, JSON.stringify(args, null, 2));
    }
  }

  /**
   * Handle tool errors consistently
   */
  protected handleError(tool: string, error: any): never {
    console.error(`[${new Date().toISOString()}] ERROR in ${tool}:`, error.message || error);
    throw new Error(`Tool ${tool} failed: ${error.message || 'Unknown error'}`);
  }
}
