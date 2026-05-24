// Import Modules
import { TrinityActor } from "./actor/trinity-actor.js";
import { TrinityActorSheet } from "./actor/trinity-actor-sheet.js";
import { TrinityItem } from "./item/item.js";
import { TrinityItemSheet } from "./item/item-sheet.js";
import { TrinityRoll } from "./trinity-roll.js"; // Updated import
import { preloadHandlebarsTemplates } from "./templates.js";
import { extendPrototypes } from "./protos.js";

/* -------------------------------------------- */
/*  Foundry V13 Initialization                  */
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
  // V13 requires this registration to ensure rolls use your class logic
  CONFIG.Dice.rolls.push(TrinityRoll);

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("trinity", TrinityActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("trinity", TrinityItemSheet, { makeDefault: true });

  // Extend Prototypes for Helper Methods
  extendPrototypes();

  // Preload Handlebars Templates
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log("Trinity | System Ready");
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
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
