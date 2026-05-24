/**
 * Trinity Continuum Roll 2
 * Updated for Foundry V13 Compatibility
 */

export class TrinityRoll2 {

  /**
   * Execute the Roll asynchronously
   * @param {Object} actor - The actor performing the roll
   * @param {Object} data - The roll data (pool, difficulty, etc.)
   */
  static async executeRoll(actor, data) {
    // V13: Ensure data.pool is a valid integer
    const pool = parseInt(data.pool) || 0;
    const tn = parseInt(data.tn) || 8;
    const difficulty = parseInt(data.difficulty) || 0;

    // V13: Formula structure (cs = count successes)
    const formula = `${pool}d10cs>=${tn}`;
    const roll = new Roll(formula, actor.getRollData());

    // MANDATORY V13: Await evaluation
    await roll.evaluate();

    // Calculate final results
    const netSuccesses = roll.total - difficulty;
    const resultText = netSuccesses >= 0 ? "Success" : "Failure";

    // V13: Send Chat Message using ChatMessage.create
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-roll-v2">
          <b>Action Roll</b><br>
          Pool: ${pool} | TN: ${tn} | Diff: ${difficulty}<br>
          <span style="color: ${netSuccesses >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">
            ${resultText}: ${netSuccesses} Net Successes
          </span>
        </div>
      `,
      rolls: [roll]
    });
  }
}
