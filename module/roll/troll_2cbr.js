/**
 * Foundry VTT v13 Compatible Roll Handler for Trinity/CBR
 * Refactored to handle asynchronous Roll.evaluate()
 */

export async function rollTrinityCBR(numDice, difficulty = 0, flavor = "") {
  // 1. Construct the formula
  // Assuming the system uses a d10 pool where 7+ is a success and 10s explode/double
  // (Adjust formula specifics below if your custom logic differs)
  let formula = `${numDice}d10cs>=7`;
  
  // 2. Create the Roll instance
  let roll = new Roll(formula);

  // 3. MANDATORY V13 CHANGE: Evaluate the roll asynchronously
  // Previous versions allowed synchronous evaluation; V13 will throw errors.
  await roll.evaluate();

  // 4. Custom Success Logic
  // Foundry v13 stores results in DiceTerm.results
  let successes = roll.dice[0].results.reduce((count, r) => {
    if (r.result >= 7) count++;
    if (r.result === 10) count++; // Example: 10s count as two successes
    return count;
  }, 0);

  let finalResult = successes - difficulty;
  let resultText = finalResult >= 0 ? "Success" : "Failure";

  // 5. Build the Chat Message
  // Using the v13 compliant Roll.toMessage or ChatMessage.create
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    flavor: `${flavor} (Diff: ${difficulty})`,
    content: `
      <div class="trinity-roll">
        <div class="roll-result ${resultText.toLowerCase()}">
          <strong>${resultText}</strong> (${finalResult} Net Successes)
        </div>
      </div>
    `,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls: [roll] // Attach the roll object for the 3D dice and tooltips
  };

  return ChatMessage.create(chatData);
}
