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
    // This will sequentially call prepareBaseData(), applyActiveEffects(), and prepareDerivedData()
    super.prepareData();
  }

  /**
   * Prepare base data modifications before Active Effects are applied.
   * @override
   */
  prepareBaseData() {
    // Add base modifications here if necessary.
    // e.g., Setting default values that Active Effects might later modify.
  }

  /**
   * Prepare derived data calculations after Active Effects are applied.
   * @override
   */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;
    const flags = actorData.flags.trinity || {};

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
    // Example: Calculate derived Health max if you want it automated based on Stamina.
    // In Trinity, this often relies on Stamina + Size + Edges.
    // If you prefer manual entry (as set up in your HTML), you can leave this blank.
    
    // Safety check to ensure the attributes object exists before trying to read it
    if (system.attributes) {
      // Loop through attributes to ensure they all have minimum values
      for (let [key, attribute] of Object.entries(system.attributes)) {
        if (attribute.value < 1) attribute.value = 1;
      }
    }
  }

  /**
   * Prepare NPC-specific derived data.
   * @param {Object} actorData The entire actor document
   * @param {Object} system    The system-specific data (V13 schema)
   */
  _prepareNpcData(actorData, system) {
    // Auto-calculate derived stats for NPCs if desired
    // E.g., setting default Defense based on Threat level
    if (system.threat && system.defense) {
       // system.defense.value = Math.max(1, system.threat.value);
    }
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
    // This allows a macro or inline roll to use @attributes.dexterity.value 
    // instead of @system.attributes.dexterity.value.
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
