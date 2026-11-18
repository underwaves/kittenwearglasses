-- 0005_security_enhancements.sql
-- Table for revoking session tokens on logout
CREATE TABLE IF NOT EXISTS revoked_sessions (
  session_id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_sessions_expires ON revoked_sessions(expires_at);
