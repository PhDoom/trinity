// Import Modules
import { TrinityActor } from "./actor/actor.js";
import { TrinityActorSheet } from "./actor/actor-sheet.js";
import { TrinityItem } from "./item/item.js";
import { TrinityItemSheet } from "./item/item-sheet.js";
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
    rollItemMacro
  };

  /**
   * Set global constants for Trinity
   */
  CONFIG.Actor.documentClass = TrinityActor;
  CONFIG.Item.documentClass = TrinityItem;

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
  // Wait for anything that requires the game world to be fully loaded
  console.log("Trinity | System Ready");
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createTrinityMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macros for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.trinity.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "trinity.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Roll Item Macro.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item's roll method (updated for V13 async)
  return item.roll();
}
