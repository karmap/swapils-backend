export type ApiEvent = {
  event_type: "api_event";
  query: string;
  type: string;
  timestamp: number;
  duration: number;
  clientId: string;
};

export type SearchMetricEvent = {
  event_type: "search_metric";
  resource: string;
  query: string;
  duration: number;
  cache: string;
  ip: string;
  country: string;
  city: string;
  timestamp: number;
};

export type SearchStatsJobEvent = {
  event_type: "search_stats_job";
  timestamp: number;
};

export type EventItem = ApiEvent | SearchMetricEvent | SearchStatsJobEvent;