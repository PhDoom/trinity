/**
 * Trinity Continuum Roll Prompt
 * Final V13 Optimized Version
 */

export class TrinityRollPrompt {

  /**
   * Display the Dialog for standard rolls.
   */
  static async confirmRoll(actor, item) {
    const sys = actor.system;
    
    // Retrieve current settings (defaults to 8 TN and 0 Difficulty)
    const settings = sys.rollSettings || {};
    
    const content = `
      <form class="trinity-roll-dialog">
        <div class="form-group">
          <label>Bonus Dice:</label>
          <input type="number" id="bonus-input" value="${settings.bonusDice?.value ?? 0}">
        </div>
        <div class="form-group">
          <label>Target Number (TN):</label>
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
        title: `Roll Configuration: ${item?.name ?? "Standard Roll"}`,
        content: content,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Roll",
            callback: (html) => {
              resolve({
                bonus: parseInt(html.find('#bonus-input').val()) || 0,
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
   * Uses standard d10 success counting (cs>=TN)
   */
  static async executeRoll(actor, pool, config) {
    if (!config) return;

    // Build the V13 compliant dice formula
    const totalPool = pool + config.bonus;
    const formula = `${totalPool}d10cs>=${config.tn}`;
    const roll = new Roll(formula, actor.getRollData());

    // MANDATORY V13: Asynchronous evaluation
    await roll.evaluate();

    // Calculate final results
    const netSuccesses = roll.total - config.difficulty;
    const isSuccess = netSuccesses >= 0;

    // Build Chat Message
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-roll-result">
          <div class="roll-header"><b>Trinity Roll</b></div>
          <div class="roll-stats">
            Pool: ${totalPool} | TN: ${config.tn} | Diff: ${config.difficulty}
          </div>
          <div class="roll-total ${isSuccess ? 'success' : 'failure'}">
            ${isSuccess ? 'Success' : 'Failure'}: ${netSuccesses} Net Successes
          </div>
        </div>
      `,
      flags: {
        "trinity.rollMetadata": {
          totalPool: totalPool,
          netSuccesses: netSuccesses,
          isSuccess: isSuccess
        }
      }
    });

    return roll;
  }
}
