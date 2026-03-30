CREATE TABLE IF NOT EXISTS runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_domain  VARCHAR(100) NOT NULL,
  current_stage   INT NOT NULL DEFAULT 0,
  is_complete     BOOLEAN DEFAULT FALSE,

  -- The 8 live metrics (0–100 scale)
  metric_revenue          INT DEFAULT 50,
  metric_impact           INT DEFAULT 50,
  metric_team_morale      INT DEFAULT 50,
  metric_customer_sat     INT DEFAULT 50,
  metric_investor_trust   INT DEFAULT 50,
  metric_mental_health    INT DEFAULT 100,
  metric_product_quality  INT DEFAULT 50,
  metric_burn_rate        INT DEFAULT 50,

  final_score     INT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);