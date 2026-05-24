/**
 * Trinity Continuum Roll Prompt (Version 3)
 * Updated for Foundry V13 - Handles advanced pool construction.
 */

export class TrinityRollPrompt3 {

  /**
   * Show the prompt dialog
   */
  static async confirmRoll(actor, params = {}) {
    const sys = actor.system;
    const settings = sys.rollSettings || {};

    const content = `
      <form>
        <div class="form-group">
          <label>Dice Pool:</label>
          <input type="number" id="pool-input" value="${params.pool || 0}">
        </div>
        <div class="form-group">
          <label>Target Number:</label>
          <input type="number" id="tn-input" value="${settings.targetNumber?.value ?? 8}">
        </div>
        <div class="form-group">
          <label>Difficulty:</label>
          <input type="number" id="diff-input" value="${settings.difficulty?.value ?? 0}">
        </div>
      </form>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: "Advanced Trinity Roll",
        content: content,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Execute Roll",
            callback: (html) => {
              resolve({
                pool: parseInt(html.find('#pool-input').val()) || 0,
                tn: parseInt(html.find('#tn-input').val()) || 8,
                difficulty: parseInt(html.find('#diff-input').val()) || 0
              });
            }
          }
        },
        default: "roll"
      }).render(true);
    });
  }

  /**
   * Execute the Roll
   * Note: Always use async/await for V13 roll evaluation
   */
  static async executeRoll(actor, config) {
    if (!config) return;

    // Build formula: Dice pool with success threshold
    const formula = `${config.pool}d10cs>=${config.tn}`;
    const roll = new Roll(formula, actor.getRollData());

    // MANDATORY V13: Await the evaluation
    await roll.evaluate();

    // Calculation logic
    const netSuccesses = roll.total - config.difficulty;
    const isSuccess = netSuccesses >= 0;

    // Build the Chat Message
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-roll-v3">
          <b>Advanced Roll</b><br>
          Pool: ${config.pool} | TN: ${config.tn} | Diff: ${config.difficulty}<br>
          <span style="color: ${isSuccess ? 'var(--color-success)' : 'var(--color-danger)'}">
            ${isSuccess ? 'Success' : 'Failure'}: ${netSuccesses} Net Successes
          </span>
        </div>
      `,
      flags: {
        "trinity.rollMetadata": {
          totalDice: config.pool,
          tn: config.tn,
          difficulty: config.difficulty,
          grossSuccesses: roll.total,
          netSuccesses: netSuccesses
        }
      }
    });

    return roll;
  }
}
