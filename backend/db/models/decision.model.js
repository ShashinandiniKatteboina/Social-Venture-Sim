const pool = require('../pool');

const DecisionModel = {
  // Save a decision + full metric snapshot at that moment
  async save({ runId, stage, decisionText, characterId, snapshot, deltas, aiResponse }) {
    const { rows } = await pool.query(
      `INSERT INTO decisions (
        run_id, stage, decision_text, character_id,
        snapshot_revenue, snapshot_impact, snapshot_team_morale,
        snapshot_customer_sat, snapshot_investor_trust, snapshot_mental_health,
        snapshot_product_quality, snapshot_burn_rate,
        delta_revenue, delta_impact, delta_team_morale,
        delta_customer_sat, delta_investor_trust, delta_mental_health,
        delta_product_quality, delta_burn_rate,
        ai_response
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,$19,$20,
        $21
      ) RETURNING *`,
      [
        runId, stage, decisionText, characterId,
        snapshot.revenue, snapshot.impact, snapshot.team_morale,
        snapshot.customer_sat, snapshot.investor_trust, snapshot.mental_health,
        snapshot.product_quality, snapshot.burn_rate,
        deltas.revenue, deltas.impact, deltas.team_morale,
        deltas.customer_sat, deltas.investor_trust, deltas.mental_health,
        deltas.product_quality, deltas.burn_rate,
        aiResponse
      ]
    );
    return rows[0];
  },

  // Get all decisions for a run (used to build the timeline)
  async getByRun(runId) {
    const { rows } = await pool.query(
      `SELECT * FROM decisions WHERE run_id = $1 ORDER BY stage ASC, created_at ASC`,
      [runId]
    );
    return rows;
  },

  // Get the snapshot at a specific stage — this is what powers the rewind
  async getSnapshotAtStage(runId, stage) {
    const { rows } = await pool.query(
      `SELECT * FROM decisions
       WHERE run_id = $1 AND stage = $2
       ORDER BY created_at DESC LIMIT 1`,
      [runId, stage]
    );
    return rows[0] || null;
  },
};

module.exports = DecisionModel;