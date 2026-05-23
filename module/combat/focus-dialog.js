/**
 * A dialog for managing Focus and Initiative for Trinity Continuum.
 * @extends {Dialog}
 */
export class FocusDialog extends Dialog {
  
  /**
   * Factory method to create and render the dialog.
   * @param {Actor} actor - The actor initiating focus.
   * @param {Object} dialogData - Initial data for the dialog.
   */
  static async create(actor, dialogData = {}) {
    // Access actor data via the V13 'system' property
    const system = actor.system;
    
    // Build the HTML for the dialog
    const html = await renderTemplate("systems/trinity/templates/combat/focus-dialog.html", {
      actor: actor,
      system: system,
      config: CONFIG.TRINITY
    });

    return new Promise((resolve) => {
      new FocusDialog({
        title: `Focus: ${actor.name}`,
        content: html,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Roll Focus",
            callback: (html) => resolve(this._onRollFocus(html, actor))
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }).render(true);
    });
  }

  /**
   * Handle the roll logic when the user clicks 'Roll Focus'
   * @private
   */
  static _onRollFocus(html, actor) {
    // Extract values from the dialog HTML
    const form = html[0].querySelector("form");
    const formData = new FormDataExtended(form);
    const data = formData.object;

    // Build the roll formula
    // V13 Migration: Use actor.getRollData() which we updated in trinity-actor.js
    const rollData = actor.getRollData();
    const formula = `1d10 + @attributes.cunning.value + ${data.bonus || 0}`;
    
    const roll = new Roll(formula, rollData);
    
    // Execute roll and send to chat
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: "Focusing for Initiative"
    });

    return roll;
  }
}
