/**
 * Trinity Continuum Roll (Legacy Utility)
 * Updated for Foundry V13 - Final Consolidation
 */

export class TrinityRoll {

  /**
   * Execute a roll and output to chat.
   * @param {Object} actor      The actor document
   * @param {Object} config     Configuration object (pool, tn, difficulty)
   */
  static async execute(actor, config) {
    const { pool, tn = 8, difficulty = 0 } = config;

    // Build the formula using modern dice syntax
    const formula = `${pool}d10cs>=${tn}`;
    const roll = new Roll(formula, actor.getRollData());

    // MANDATORY V13: Asynchronous evaluation
    await roll.evaluate();

    // Logic: Net Successes = Gross - Difficulty
    const netSuccesses = roll.total - difficulty;
    const isSuccess = netSuccesses >= 0;

    // V13 Chat Message Implementation
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-roll-container">
          <div class="roll-header"><b>Roll Execution</b></div>
          <div class="roll-details">
            Dice: ${pool} | TN: ${tn} | Diff: ${difficulty}
          </div>
          <div class="roll-result ${isSuccess ? 'success' : 'failure'}">
            ${isSuccess ? 'Success' : 'Failure'}: ${netSuccesses} Net Successes
          </div>
        </div>
      `,
      rolls: [roll],
      flags: {
        "trinity.rollData": {
          netSuccesses: netSuccesses,
          isSuccess: isSuccess
        }
      }
    });

    return roll;
  }

  /**
   * Helper to fetch actor's current roll settings
   * V13: Uses the .system property
   */
  static getRollSettings(actor) {
    const sys = actor.system;
    return {
      tn: sys.rollSettings?.targetNumber?.value ?? 8,
      difficulty: sys.rollSettings?.difficulty?.value ?? 0
    };
  }
}
