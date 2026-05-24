/**
 * Trinity Continuum Roll Dialog for Foundry V13.
 * Handles the pop-up UI for adjusting dice pools before rolling.
 */
export class TrinityRollDialog extends Dialog {

  /**
   * Create a new Roll Dialog.
   * @param {Actor} actor       The actor performing the roll.
   * @param {Object} rollData   Data including initial pool, attributes, and skills.
   */
  static async create(actor, rollData = {}) {
    const system = actor.system;
    const settings = system.rollSettings;

    // Build the HTML content
    const html = await renderTemplate("systems/trinity/templates/roll/roll-dialog.html", {
      actor: actor,
      system: system,
      rollData: rollData,
      // Use values from the restored rollSettings as defaults
      targetNumber: settings.targetNumber.value || 8,
      difficulty: settings.difficulty.value || 0,
      bonusDice: settings.bonusDice.value || 0
    });

    return new Promise(resolve => {
      new TrinityRollDialog({
        title: `Roll: ${rollData.label || "Dice Pool"}`,
        content: html,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Roll",
            callback: (html) => resolve(this._onRoll(html, actor, rollData))
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "roll"
      }).render(true);
    });
  }

  /**
   * Handle the final roll execution after clicking 'Roll'.
   */
  static async _onRoll(html, actor, rollData) {
    const form = html[0].querySelector("form");
    
    // Extract values from the form
    const bonus = parseInt(form.bonusDice?.value) || 0;
    const difficulty = parseInt(form.difficulty?.value) || 0;
    const tn = parseInt(form.targetNumber?.value) || 8;
    
    const totalDice = (rollData.pool || 0) + bonus;
    
    // V13 Migration: Success counting syntax
    // Trinity usually counts successes on TN or higher
    const formula = `${totalDice}d10cs>=${tn}`;
    
    const roll = new Roll(formula, actor.getRollData());
    
    // V13 Requirement: Asynchronous evaluation
    await roll.evaluate();

    // Send to Chat
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `<b>${rollData.label}</b><br>Difficulty: ${difficulty} | Target: ${tn}`
    });

    return roll;
  }
}
