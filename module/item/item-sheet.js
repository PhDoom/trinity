/**
 * Trinity Item Sheet
 * Updated for Foundry V13 compatibility
 */

export class TrinityItemSheet extends ItemSheet {
  
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // V13: Ensure listener binding is clean
    html.find(".roll-power").click(this._onRollPower.bind(this));
  }

  /**
   * Handle Power Roll Execution
   * Triggered by clicking a button with the class 'roll-power' in your HTML
   */
  async _onRollPower(event) {
    event.preventDefault();
    
    // Ensure we have an actor to roll for
    const actor = this.item.actor;
    if (!actor) {
      ui.notifications.warn("This item must be owned by an actor to roll.");
      return;
    }

    // Import your Prompt class (adjust path as needed based on your module folder structure)
    // Assuming TrinityRollPrompt3 is in the same module scope or globally available
    const { TrinityRollPrompt3 } = await import("../trinity-roll-prompt3_old.js");

    // Get the dice pool from the item's system data
    // V13: Use .system instead of .data.data
    const pool = this.item.system.dicePool || 0;

    // Open the prompt
    const config = await TrinityRollPrompt3.confirmRoll(actor, { pool: pool });
    
    // Execute the roll
    await TrinityRollPrompt3.executeRoll(actor, config);
  }
}
