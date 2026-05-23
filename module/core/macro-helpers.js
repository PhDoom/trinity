/**
 * Trinity Continuum Macro Helpers for Foundry V13
 */

/**
 * Roll an item macro by name.
 * @param {string} itemName
 * @return {Promise}
 */
export async function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  
  // Find the item on the actor
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled actor does not have an item named ${itemName}`);

  // Trigger the item's roll logic
  // This assumes your TrinityItem class has a roll() method, which we updated for V13
  return item.roll();
}

/**
 * Specialized macro for rolling a Trinity Dice Pool
 * @param {Object} options  Pool options including attributes, skills, and rollSettings
 */
export async function rollTrinityPool({attribute=0, skill=0, poolName="Dice Pool"}={}) {
  const speaker = ChatMessage.getSpeaker();
  const actor = game.actors.get(speaker.actor);
  
  if (!actor) return ui.notifications.warn("Please select a token or actor to roll.");

  // V13 Migration: Access system data for rollSettings
  const settings = actor.system.rollSettings;
  const targetNumber = settings?.targetNumber?.value ?? 8;
  const doubleSuccess = settings?.doubleSuccess?.value ?? 10;
  
  const totalDice = attribute + skill;
  const formula = `${totalDice}d10cs>=${targetNumber}`;
  
  const roll = new Roll(formula);
  
  // V13 Requirement: Evaluation is asynchronous
  await roll.evaluate();

  // Create Chat Message
  await roll.toMessage({
    speaker: speaker,
    flavor: `<b>${poolName}</b><br>Target: ${targetNumber} | Double on: ${doubleSuccess}`
  });
}
