CREATE TABLE IF NOT EXISTS search_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,   -- PK

  resource TEXT NOT NULL,                 -- "people" | "films"
  query TEXT NOT NULL,                    -- search term
  duration INTEGER NOT NULL,              -- ms
  cache TEXT NOT NULL,                    -- HIT | MISS

  ip TEXT,                                -- client IP
  country TEXT,                           -- CF geo
  city TEXT,                              -- CF city

  timestamp INTEGER NOT NULL              -- epoch ms UTC
);