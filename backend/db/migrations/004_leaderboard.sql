CREATE TABLE IF NOT EXISTS leaderboard (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_id         UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  user_name      VARCHAR(100) NOT NULL,
  problem_domain VARCHAR(100) NOT NULL,
  final_score    INT NOT NULL,
  stages_cleared INT NOT NULL,
  achieved_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(final_score DESC);