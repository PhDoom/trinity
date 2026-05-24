/**
 * Trinity Continuum Prototype Extensions for Foundry V13.
 * Logic here adds helper methods to all Actor and Item instances.
 */

export const extendPrototypes = function() {

  /* -------------------------------------------- */
  /*  Actor Prototypes                            */
  /* -------------------------------------------- */

  /**
   * Shortcut to check if an actor is a specific Trinity sub-type.
   * Usage: actor.isType('psion')
   */
  Actor.prototype.isType = function(type) {
    return this.system.subType === type;
  };

  /**
   * Retrieves a specific attribute value safely.
   */
  Actor.prototype.getAttr = function(attrName) {
    const attr = this.system.attributes?.[attrName];
    return attr ? (attr.value || 0) : 0;
  };

  /**
   * Retrieves a specific skill value safely.
   */
  Actor.prototype.getSkill = function(skillName) {
    const skill = this.system.skills?.[skillName];
    return skill ? (skill.value || 0) : 0;
  };

  /* -------------------------------------------- */
  /*  Item Prototypes                             */
  /* -------------------------------------------- */

  /**
   * Helper to determine if an item is a "Power" type (Gift, Spell, etc.)
   * Based on the restored template.json sub-types.
   */
  Item.prototype.isPower = function() {
    const powerTypes = ['gift', 'spell', 'power', 'quantumpower'];
    return powerTypes.includes(this.type);
  };

  /* -------------------------------------------- */
  /*  Global Roll Helpers                         */
  /* -------------------------------------------- */

  /**
   * V13 Requirement: Asynchronous Roll Helper
   * Can be called on any actor to trigger a standard Trinity d10 pool.
   */
  Actor.prototype.executeTrinityRoll = async function(poolSize, flavor = "Dice Pool") {
    const tn = this.system.rollSettings?.targetNumber?.value ?? 8;
    const formula = `${poolSize}d10cs>=${tn}`;
    
    const roll = new Roll(formula, this.getRollData());
    
    // V13: Must await evaluation
    await roll.evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<b>${flavor}</b><br>Target Number: ${tn}`
    });
  };

  console.log("Trinity | Prototypes Extended for V13");
};
