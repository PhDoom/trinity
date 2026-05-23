/**
 * Extend the basic Item with Trinity-specific logic for V13.
 * @extends {Item}
 */
export class TrinityItem extends Item {

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
    // V13 Migration: Data is now stored in this.system
    const itemData = this.system;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   */
  async roll() {
    const item = this;
    const actor = this.actor;
    const system = this.system;

    // Initialize the roll data
    const rollData = {
      ...this.getRollData(),
      item: system
    };

    // Determine the roll formula based on item type
    // This utilizes the rollSettings we restored in template.json
    let label = `<b>${item.name}</b>`;
    let formula = "1d10"; // Default fallback

    if (item.type === 'weapon') {
      const targetNumber = actor?.system?.rollSettings?.targetNumber?.value ?? 8;
      label = `<b>Weapon Attack: ${item.name}</b>`;
      // Example formula: Dice pool based on damage + attribute
      // Adjust this logic to match your specific Trinity house rules
      formula = `(${system.damage})d10cs>=${targetNumber}`;
    }

    // V13 Requirement: Roll evaluation must be awaited
    const roll = new Roll(formula, rollData);
    await roll.evaluate();

    // Create the Chat Message
    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get("core", "rollMode")
    });
  }
}
