/**
 * Extend the base Actor entity to handle Trinity-specific logic
 * @extends {Actor}
 */
export class TrinityActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this;
    const system = actorData.system;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep things tidy.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'npc') this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const system = actorData.system;

    // Add any derived data logic here. 
    // Example: If defense is always Might + 5, you would calculate it here:
    // system.defense = (system.attributes.might.value || 0) + 5;
  }

  /**
   * Prepare NPC type specific data
   */
  _prepareNpcData(actorData) {
    const system = actorData.system;
    // Handle NPC-specific derived stats if necessary
  }

  /**
   * Prepare data for use in roll formulas.
   * This is what @attributes.might.value uses in a roll string.
   */
  getRollData() {
    const data = super.getRollData();
    const system = this.system;

    // In V13, we want to ensure the roll data points directly to the system object
    // This allows rolls like /r 1d20 + @attributes.might.value to work perfectly.
    const rollData = {
      ...system
    };

    return rollData;
  }
}
