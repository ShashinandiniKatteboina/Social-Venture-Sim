const pool = require('../pool');

const RunModel = {
  async create({ userId, problemDomain }) {
    const { rows } = await pool.query(
      `INSERT INTO runs (user_id, problem_domain)
       VALUES ($1, $2) RETURNING *`,
      [userId, problemDomain]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM runs WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM runs WHERE user_id = $1 ORDER BY started_at DESC`,
      [userId]
    );
    return rows;
  },

  async updateMetrics(runId, metrics) {
    const {
      revenue, impact, team_morale, customer_sat,
      investor_trust, mental_health, product_quality, burn_rate,
      current_stage
    } = metrics;

    const { rows } = await pool.query(
      `UPDATE runs SET
        metric_revenue = $1, metric_impact = $2,
        metric_team_morale = $3, metric_customer_sat = $4,
        metric_investor_trust = $5, metric_mental_health = $6,
        metric_product_quality = $7, metric_burn_rate = $8,
        current_stage = $9
       WHERE id = $10 RETURNING *`,
      [revenue, impact, team_morale, customer_sat,
       investor_trust, mental_health, product_quality, burn_rate,
       current_stage, runId]
    );
    return rows[0];
  },

  async complete(runId, finalScore) {
    const { rows } = await pool.query(
      `UPDATE runs SET is_complete = TRUE, final_score = $1, completed_at = NOW()
       WHERE id = $2 RETURNING *`,
      [finalScore, runId]
    );
    return rows[0];
  },
};

module.exports = RunModel;