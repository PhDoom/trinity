/**
 * Trinity Continuum Roll Prompt (Version 4)
 * Updated for Foundry V13 - Handles Quantum/Power resource integration.
 */

export class TrinityRollPrompt4 {

  /**
   * Display the Dialog for specialized rolls
   */
  static async confirmRoll(actor, item) {
    const sys = actor.system;
    
    // Check for resources (e.g., Quantum or Psi points)
    const resourceName = sys.resources?.quantum?.label || "Quantum";
    const resourceVal = sys.resources?.quantum?.value || 0;

    const content = `
      <form class="trinity-roll-v4">
        <div class="form-group">
          <label>Dice Pool:</label>
          <input type="number" id="pool-input" value="${item?.system?.dicePool || 0}">
        </div>
        <div class="form-group">
          <label>Spend ${resourceName}:</label>
          <input type="number" id="spend-input" value="0" max="${resourceVal}">
        </div>
        <div class="form-group">
          <label>Difficulty:</label>
          <input type="number" id="diff-input" value="0">
        </div>
      </form>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: `Roll: ${item?.name || "Power"}`,
        content: content,
        buttons: {
          roll: {
            icon: '<i class="fas fa-bolt"></i>',
            label: "Roll",
            callback: (html) => {
              resolve({
                pool: parseInt(html.find('#pool-input').val()) || 0,
                spend: parseInt(html.find('#spend-input').val()) || 0,
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
   * Execute the Roll asynchronously
   */
  static async executeRoll(actor, config) {
    if (!config) return;

    // V13: Formula with success counting
    const formula = `${config.pool}d10cs>=8`;
    const roll = new Roll(formula, actor.getRollData());

    // MANDATORY V13: Await evaluation
    await roll.evaluate();

    // Logic: Spending resource adds automatic successes
    const totalSuccesses = roll.total + config.spend - config.difficulty;

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-roll-v4">
          <b>${actor.name} uses ${config.spend > 0 ? 'Quantum' : 'Power'}</b><br>
          Gross Successes: ${roll.total} | Resources Spent: ${config.spend}<br>
          <strong>Net Successes: ${totalSuccesses}</strong>
        </div>
      `,
      flags: {
        "trinity.rollMetadata": {
          spend: config.spend,
          difficulty: config.difficulty,
          netSuccesses: totalSuccesses
        }
      }
    });

    // Optional: Auto-deduct resources if you have the actor-update logic configured
    if (config.spend > 0) {
      await actor.update({
        "system.resources.quantum.value": Math.max(0, actor.system.resources.quantum.value - config.spend)
      });
    }
  }
}
