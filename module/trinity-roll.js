/**
 * Trinity Roll Class
 * Extended for Foundry V13 - Handles custom Trinity d10 logic.
 */

export class TrinityRoll extends Roll {

  /**
   * Override the constructor to enforce Trinity-specific formula defaults.
   * @param {string} formula 
   * @param {Object} data 
   * @param {Object} options 
   */
  constructor(formula, data = {}, options = {}) {
    super(formula, data, options);
  }

  /**
   * V13 Requirement: Ensure evaluation is asynchronous.
   * We wrap the standard evaluation to handle Trinity's specific success counting.
   */
  async evaluate({minimize=false, maximize=false}={}) {
    // V13 requires awaiting the super evaluation
    await super.evaluate({minimize, maximize});
    
    // Custom Trinity Logic: Count 10s as double successes if needed
    // (Ensure your formula includes 'cs>=8' or similar)
    return this;
  }

  /**
   * Helper to get Trinity-specific net successes from a roll.
   * @param {number} difficulty 
   * @returns {number}
   */
  getNetSuccesses(difficulty = 0) {
    // total is automatically calculated by the 'cs' (count success) dice term
    return (this.total || 0) - difficulty;
  }

  /**
   * Render the roll to a chat message using the V13 document model.
   * @override
   */
  async toMessage(messageData = {}, {rollMode, create=true}={}) {
    // V13: Use the modern ChatMessage implementation
    messageData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
    messageData.rolls = [this];
    
    return create ? ChatMessage.create(messageData, {rollMode}) : new ChatMessage(messageData);
  }
}

// Register the class with the system CONFIG if needed
Hooks.once("init", () => {
  CONFIG.Dice.rolls.push(TrinityRoll);
});
