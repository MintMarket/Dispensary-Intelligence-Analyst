/**
 * Mock Tool Provider
 * Generates realistic mock data for development and testing
 */

import { addDays, subDays, format } from 'date-fns';
import { BaseToolProvider } from './base-provider';
import {
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
  SearchResult,
  Event,
  PlaceRating,
  Observation,
} from '../types';

export class MockToolProvider extends BaseToolProvider {
  private mockDelay: number;

  constructor(orgId: string, mockDelay = 100) {
    super(orgId);
    this.mockDelay = mockDelay;
  }

  /**
   * Simulate network delay
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.mockDelay));
  }

  async searchCompetitors(
    args: SearchCompetitorsArgs
  ): Promise<SearchCompetitorsResponse> {
    this.log('searchCompetitors', args);
    await this.delay();

    const limit = args.limit || 25;
    const isPromoQuery = args.query.toLowerCase().includes('% off') ||
                         args.query.toLowerCase().includes('sale') ||
                         args.query.toLowerCase().includes('bogo');

    const mockResults: SearchResult[] = [];

    if (isPromoQuery) {
      // Generate promo-related results
      mockResults.push(
        {
          title: 'Green Haven Dispensary - 30% Off All Flower This Weekend',
          snippet: 'Stock up and save! Enjoy 30% off all flower products, Friday through Sunday only. Wide selection of premium strains.',
          url: 'https://example.com/greenhaven/promo-flower-30off',
          publishedAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'Green Haven Dispensary Website',
        },
        {
          title: 'Sunny Buds - BOGO Edibles Every Tuesday',
          snippet: 'Buy one, get one free on all edibles every Tuesday. Premium brands included.',
          url: 'https://example.com/sunnybuds/bogo-tuesday',
          publishedAt: format(subDays(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'Sunny Buds Newsletter',
        },
        {
          title: 'Desert Rose Cannabis - 25% Off Concentrates',
          snippet: 'Limited time offer: 25% off all concentrates. Top-shelf wax, shatter, and live resin.',
          url: 'https://example.com/desertrose/concentrates-sale',
          publishedAt: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'Desert Rose Social Media',
        },
        {
          title: 'High Times Dispensary - Vendor Day with Cookies Brand',
          snippet: 'Join us this Thursday for Cookies Vendor Day! Special pricing, exclusive drops, and meet the team.',
          url: 'https://example.com/hightimes/cookies-vendor-day',
          publishedAt: format(subDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'High Times Events',
        },
        {
          title: 'Canna Corner - Grand Opening Next Week!',
          snippet: 'Grand opening celebration! 40% off everything, live music, and giveaways. Now open in North Phoenix.',
          url: 'https://example.com/cannacorner/grand-opening',
          publishedAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'Canna Corner Press Release',
        }
      );
    } else {
      // Generic market news
      mockResults.push(
        {
          title: `${args.market} Cannabis Market Update`,
          snippet: 'Recent trends and developments in the local cannabis market.',
          url: 'https://example.com/market-update',
          publishedAt: format(subDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          source: 'Industry News',
        }
      );
    }

    return {
      results: mockResults.slice(0, limit),
    };
  }

  async fetchEvents(args: FetchEventsArgs): Promise<FetchEventsResponse> {
    this.log('fetchEvents', args);
    await this.delay();

    const daysAhead = args.daysAhead || 21;
    const mockEvents: Event[] = [
      {
        name: 'Cannabis Industry Expo',
        start: format(addDays(new Date(), 5), "yyyy-MM-dd'T'10:00:00'Z'"),
        end: format(addDays(new Date(), 5), "yyyy-MM-dd'T'18:00:00'Z'"),
        venue: 'Convention Center',
        address: `123 Main St, ${args.location}`,
        url: 'https://example.com/cannabis-expo',
        source: 'Eventbrite',
      },
      {
        name: '420 Festival',
        start: format(addDays(new Date(), 12), "yyyy-MM-dd'T'12:00:00'Z'"),
        end: format(addDays(new Date(), 12), "yyyy-MM-dd'T'22:00:00'Z'"),
        venue: 'City Park',
        address: `456 Park Ave, ${args.location}`,
        url: 'https://example.com/420-festival',
        source: 'Local Events',
      },
      {
        name: 'Medical Cannabis Seminar',
        start: format(addDays(new Date(), 18), "yyyy-MM-dd'T'14:00:00'Z'"),
        end: format(addDays(new Date(), 18), "yyyy-MM-dd'T'17:00:00'Z'"),
        venue: 'Community Center',
        address: `789 Health Blvd, ${args.location}`,
        url: 'https://example.com/med-cannabis-seminar',
        source: 'Meetup',
      },
    ];

    return {
      events: mockEvents.filter((e) => {
        const eventDate = new Date(e.start);
        const maxDate = addDays(new Date(), daysAhead);
        return eventDate <= maxDate;
      }),
    };
  }

  async getPlacesRatings(
    args: GetPlacesRatingsArgs
  ): Promise<GetPlacesRatingsResponse> {
    this.log('getPlacesRatings', args);
    await this.delay();

    const mockPlaces: PlaceRating[] = [
      {
        name: 'Green Haven Dispensary',
        rating: 4.5,
        userRatingsTotal: 342,
        address: `100 Cannabis Ln, ${args.location}`,
        placeId: 'mock-place-1',
        source: 'Google Places',
      },
      {
        name: 'Sunny Buds',
        rating: 4.2,
        userRatingsTotal: 189,
        address: `200 Hemp St, ${args.location}`,
        placeId: 'mock-place-2',
        source: 'Google Places',
      },
      {
        name: 'Desert Rose Cannabis',
        rating: 4.7,
        userRatingsTotal: 521,
        address: `300 Indica Ave, ${args.location}`,
        placeId: 'mock-place-3',
        source: 'Google Places',
      },
      {
        name: 'High Times Dispensary',
        rating: 4.0,
        userRatingsTotal: 267,
        address: `400 Sativa Blvd, ${args.location}`,
        placeId: 'mock-place-4',
        source: 'Google Places',
      },
      {
        name: 'Canna Corner',
        rating: 4.8,
        userRatingsTotal: 95,
        address: `500 Green Way, ${args.location}`,
        placeId: 'mock-place-5',
        source: 'Google Places',
      },
    ];

    return { places: mockPlaces };
  }

  async listObservations(
    args: ListObservationsArgs
  ): Promise<ListObservationsResponse> {
    this.log('listObservations', args);
    await this.delay();

    const sinceDays = args.sinceDays || 14;
    const mockObservations: Observation[] = [
      {
        timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd'T'10:30:00'Z'"),
        type: 'promo',
        market: args.market,
        competitor: 'Green Haven Dispensary',
        brand: 'Various',
        product: 'Flower',
        discount: 30,
        start_date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
        end_date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        store: 'All locations',
        source_url: 'https://example.com/greenhaven/promo-flower-30off',
        notes: '30% off all flower, weekend sale',
      },
      {
        timestamp: format(subDays(new Date(), 5), "yyyy-MM-dd'T'14:15:00'Z'"),
        type: 'pricing',
        market: args.market,
        competitor: 'Desert Rose Cannabis',
        brand: 'Cookies',
        product: 'Gary Payton 1/8oz',
        size: '3.5g',
        potency: '28% THC',
        price: 45,
        store: 'Main location',
        source_url: 'https://weedmaps.com/desertrose',
        notes: 'Regular pricing observed',
      },
      {
        timestamp: format(subDays(new Date(), 7), "yyyy-MM-dd'T'09:00:00'Z'"),
        type: 'promo',
        market: args.market,
        competitor: 'Desert Rose Cannabis',
        brand: 'Various',
        product: 'Concentrates',
        discount: 25,
        start_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
        end_date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        store: 'All locations',
        source_url: 'https://example.com/desertrose/concentrates-sale',
        notes: '25% off all concentrates, limited time',
      },
      {
        timestamp: format(subDays(new Date(), 3), "yyyy-MM-dd'T'11:20:00'Z'"),
        type: 'event',
        market: args.market,
        competitor: 'High Times Dispensary',
        brand: 'Cookies',
        start_date: format(addDays(new Date(), 2), "yyyy-MM-dd"),
        store: 'Downtown location',
        source_url: 'https://example.com/hightimes/cookies-vendor-day',
        notes: 'Cookies vendor day - special pricing and exclusive drops',
      },
      {
        timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd'T'16:45:00'Z'"),
        type: 'opening',
        market: args.market,
        competitor: 'Canna Corner',
        start_date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
        store: 'North Phoenix',
        source_url: 'https://example.com/cannacorner/grand-opening',
        notes: 'Grand opening with 40% off everything',
      },
    ];

    return {
      observations: mockObservations.filter((obs) => {
        const obsDate = new Date(obs.timestamp);
        const cutoffDate = subDays(new Date(), sinceDays);
        return obsDate >= cutoffDate;
      }),
    };
  }

  async listFutureEvents(
    args: ListFutureEventsArgs
  ): Promise<ListFutureEventsResponse> {
    this.log('listFutureEvents', args);
    await this.delay();

    const daysAhead = args.daysAhead || 21;
    const mockEvents: Event[] = [
      {
        name: 'Cookies Vendor Day - High Times',
        start: format(addDays(new Date(), 2), "yyyy-MM-dd'T'10:00:00'Z'"),
        end: format(addDays(new Date(), 2), "yyyy-MM-dd'T'18:00:00'Z'"),
        venue: 'High Times Dispensary',
        address: `400 Sativa Blvd, ${args.market}`,
        url: 'https://example.com/hightimes/cookies-vendor-day',
        source: 'Internal Calendar',
      },
      {
        name: 'Canna Corner Grand Opening',
        start: format(addDays(new Date(), 5), "yyyy-MM-dd'T'09:00:00'Z'"),
        end: format(addDays(new Date(), 5), "yyyy-MM-dd'T'21:00:00'Z'"),
        venue: 'Canna Corner',
        address: `500 Green Way, ${args.market}`,
        url: 'https://example.com/cannacorner/grand-opening',
        source: 'Competitor Tracking',
      },
      {
        name: 'Green Haven Anniversary Sale',
        start: format(addDays(new Date(), 14), "yyyy-MM-dd'T'00:00:00'Z'"),
        end: format(addDays(new Date(), 16), "yyyy-MM-dd'T'23:59:59'Z'"),
        venue: 'Green Haven Dispensary',
        address: `100 Cannabis Ln, ${args.market}`,
        source: 'Social Media Monitoring',
      },
    ];

    return {
      events: mockEvents.filter((e) => {
        const eventDate = new Date(e.start);
        const maxDate = addDays(new Date(), daysAhead);
        return eventDate <= maxDate;
      }),
    };
  }
}
