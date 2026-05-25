// Import Modules
import { TrinityActor } from "./actor/trinity-actor.js";
import { TrinityActorSheet } from "./actor/trinity-actor-sheet.js";
import { TrinityItem } from "./item/item.js";
import { TrinityItemSheet } from "./item/item-sheet.js";
import { TrinityRoll } from "./trinity-roll.js"; 
import { extendPrototypes } from "./protos.js";
// Added back the template preloader
import { preloadHandlebarsTemplates } from "./templates.js"; 

/* -------------------------------------------- */
/* Foundry V13 Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  console.log("Trinity | Initializing Trinity Continuum System for V13");

  // Create a namespace for system-specific functions
  game.trinity = {
    TrinityActor,
    TrinityItem,
    TrinityRoll,
    rollItemMacro
  };

  /**
   * Set global constants and Document Classes
   */
  CONFIG.Actor.documentClass = TrinityActor;
  CONFIG.Item.documentClass = TrinityItem;
  
  // Register the Custom Roll Class
  CONFIG.Dice.rolls.push(TrinityRoll);

  /* -------------------------------------------- */
  /* V13 Sheet Registration                      */
  /* -------------------------------------------- */

  // 1. Unregister the core Foundry fallback sheets
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  // 2. Register Custom Actor Sheet
  Actors.registerSheet("trinity", TrinityActorSheet, {
      types: ["character", "npc"], 
      makeDefault: true,
      label: "Trinity Modern Sheet"
  });

  // 3. Register Custom Item Sheet
  Items.registerSheet("trinity", TrinityItemSheet, {
      types: ["item", "feature", "spell"], 
      makeDefault: true,
      label: "Trinity Item Sheet"
  });

  // Extend Prototypes for Helper Methods
  extendPrototypes();

  // Load HTML Partials
  return preloadHandlebarsTemplates();

});

/* -------------------------------------------- */
/* Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log("Trinity | System Ready");
});

/* -------------------------------------------- */
/* Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Roll Item Macro.
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item's roll method
  return item.roll();
}
