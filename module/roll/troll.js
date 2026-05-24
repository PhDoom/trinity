/**
 * Trinity/Aeon Roll Logic for Foundry VTT v13
 * Handles success counting, exploding dice, and chat integration.
 */
export async function trinityRoll({
  parts = [],
  data = {},
  flavor = null,
  successValue = 7,
  failValue = 1,
  explodeValue = 10
} = {}) {
  
  // 1. Build the formula (e.g., "5d10")
  const formula = parts.join(" + ");
  
  // 2. Instantiate the Roll
  const roll = new Roll(formula, data);

  // 3. MANDATORY V13 CHANGE: Asynchronous Evaluation
  // We await the evaluation before accessing any results.
  await roll.evaluate();

  // 4. Process Successes and Explosions
  // We extract the dice terms to count results based on Trinity rules
  let successes = 0;
  let explosions = 0;

  for (let term of roll.terms) {
    if (term instanceof DiceTerm) {
      term.results.forEach(r => {
        if (r.result >= successValue) successes++;
        if (r.result >= explodeValue) successes++; // Double success on 10s
        if (r.result === failValue) successes--;   // Botch potential
      });
    }
  }

  // 5. Build the Chat Content
  // Note: V13 uses "rolls" (array) instead of "roll" (single object)
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor || "Trinity Roll",
    type: CONST.CHAT_MESSAGE_STYLES.ROLL, // V12/V13 use STYLES constant
    rolls: [roll], 
    content: `
      <div class="trinity-roll">
        <div class="dice-total">${successes} Successes</div>
        <div class="dice-formula">${roll.formula}</div>
      </div>
    `
  };

  // 6. Create the Message
  return ChatMessage.create(chatData);
}
