CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT,
  type TEXT,
  timestamp INTEGER,
  duration INTEGER,
  clientId TEXT
);