/**
 * Trinity Continuum Roll Logic (Version 3) for Foundry V13.
 * Handles specialized success counting, explosions, and chat rendering.
 */
export async function troll3({
  parts = [],
  data = {},
  flavor = null,
  targetNumber = 8,
  doubleSuccess = 10,
  difficulty = 0,
  bonusDice = 0
} = {}) {
  
  // 1. Construct the dice pool
  // We combine the base parts and any bonus dice from the roll settings
  const totalDice = parts.reduce((a, b) => a + b, 0) + bonusDice;
  const formula = `${totalDice}d10cs>=${targetNumber}`;
  
  // 2. Instantiate the Roll
  const roll = new Roll(formula, data);

  // 3. MANDATORY V13 CHANGE: Asynchronous Evaluation
  // Must await evaluation before accessing results or sending to chat.
  await roll.evaluate();

  // 4. Custom Success Processing
  // We manually count successes to handle the "Double Success" rule
  let successes = 0;
  for (let term of roll.terms) {
    if (term instanceof DiceTerm) {
      term.results.forEach(r => {
        if (r.result >= targetNumber) successes++;
        if (r.result >= doubleSuccess) successes++;
      });
    }
  }

  const netSuccesses = successes - difficulty;
  const isSuccess = netSuccesses >= 0;

  // 5. Build the Chat Content
  // V13 uses 'rolls' as an array and a simplified message structure
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor || "Trinity Roll",
    type: CONST.CHAT_MESSAGE_STYLES ? CONST.CHAT_MESSAGE_STYLES.ROLL : 5, 
    rolls: [roll],
    content: `
      <div class="trinity-roll-v3">
        <div class="dice-total ${isSuccess ? 'success' : 'failure'}">
          ${netSuccesses} Successes
        </div>
        <div class="dice-details">
          Difficulty: ${difficulty} | Target: ${targetNumber}
        </div>
      </div>
    `
  };

  // 6. Create the Chat Message
  return ChatMessage.create(chatData);
}
