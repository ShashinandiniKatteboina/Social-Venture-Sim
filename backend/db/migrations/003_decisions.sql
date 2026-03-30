CREATE TABLE IF NOT EXISTS decisions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  stage         INT NOT NULL,
  decision_text TEXT NOT NULL,
  character_id  VARCHAR(50),

  -- Full metric snapshot at the moment of this decision
  snapshot_revenue          INT,
  snapshot_impact           INT,
  snapshot_team_morale      INT,
  snapshot_customer_sat     INT,
  snapshot_investor_trust   INT,
  snapshot_mental_health    INT,
  snapshot_product_quality  INT,
  snapshot_burn_rate        INT,

  -- Metric deltas caused by this decision
  delta_revenue          INT DEFAULT 0,
  delta_impact           INT DEFAULT 0,
  delta_team_morale      INT DEFAULT 0,
  delta_customer_sat     INT DEFAULT 0,
  delta_investor_trust   INT DEFAULT 0,
  delta_mental_health    INT DEFAULT 0,
  delta_product_quality  INT DEFAULT 0,
  delta_burn_rate        INT DEFAULT 0,

  ai_response   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);