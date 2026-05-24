/**
 * Trinity Continuum Actor Class
 * Updated for Foundry V13 Compatibility & Modern Data Model
 */

export class TrinityActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   * @override
   */
  prepareData() {
    // V13: super.prepareData() triggers the underlying Document preparation lifecycle
    // This sequentially calls prepareBaseData(), applyActiveEffects(), and prepareDerivedData()
    super.prepareData();
  }

  /**
   * Prepare base data modifications before Active Effects are applied.
   * @override
   */
  prepareBaseData() {
    // Add base modifications here if necessary.
  }

  /**
   * Prepare derived data calculations after Active Effects are applied.
   * @override
   */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;

    // Route data preparation based on the actor type
    if (actorData.type === 'character') this._prepareCharacterData(actorData, system);
    if (actorData.type === 'npc') this._prepareNpcData(actorData, system);
  }

  /**
   * Prepare Character-specific derived data.
   * @param {Object} actorData The entire actor document
   * @param {Object} system    The system-specific data (V13 schema)
   */
  _prepareCharacterData(actorData, system) {
    // Safety check to ensure the attributes object exists
    if (system.attributes) {
      // Loop through attributes to ensure they all have minimum values
      for (let [key, attribute] of Object.entries(system.attributes)) {
        if (attribute.value < 1) attribute.value = 1;
      }
    }

    // --- CONDITIONS BACKEND HOOK ---
    // If you want to automate Condition penalties in the future, 
    // this gathers all condition items embedded on the character.
    const conditionItems = this.items.filter(i => i.type === 'condition');
    
    // Example logic for the future:
    // conditionItems.forEach(condition => {
    //   if (condition.name === "Stunned") {
    //     // Apply penalty logic here
    //   }
    // });
  }

  /**
   * Prepare NPC-specific derived data.
   * @param {Object} actorData The entire actor document
   * @param {Object} system    The system-specific data (V13 schema)
   */
  _prepareNpcData(actorData, system) {
    // Auto-calculate derived stats for NPCs if desired
  }

  /**
   * Override getRollData to ensure inline rolls and macros can easily access
   * the actor's system data without needing the 'system.' prefix in the formula.
   * @override
   */
  getRollData() {
    // Start with the base document data
    const data = super.getRollData();
    
    // V13: Merge the system data into the top level of the return object.
    // This allows a macro to use @attributes.dexterity.value instead of @system.attributes.dexterity.value
    if (this.system) {
      foundry.utils.mergeObject(data, this.system);
    }

    // Add explicit references to core calculations if needed for macros
    if (data.attributes) {
      for ( let [k, v] of Object.entries(data.attributes) ) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    return data;
  }

}
