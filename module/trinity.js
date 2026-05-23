// Import Modules
import { TrinityActor } from "./actor/trinity-actor.js";
import { TrinityActorSheet } from "./actor/trinity-actor-sheet.js";
import { TrinityItem } from "./item/trinity-item.js";
import { TrinityItemSheet } from "./item/trinity-item-sheet.js";
import { TrinityCombat } from "./combat/trinity-combat.js";
import { registerSettings } from "./core/game-settings.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  console.log('Trinity | Initializing Trinity Continuum System');

  // Register custom system settings
  registerSettings();

  /**
   * Set dynamic CONFIG values for V13
   */
  CONFIG.Actor.documentClass = TrinityActor;
  CONFIG.Item.documentClass = TrinityItem;
  CONFIG.Combat.documentClass = TrinityCombat;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("trinity", TrinityActorSheet, { makeDefault: true });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("trinity", TrinityItemSheet, { makeDefault: true });

  // Pre-load HTML templates for faster rendering
  return loadTemplates([
    "systems/trinity/templates/actor/actor-sheet.html",
    "systems/trinity/templates/item/item-sheet.html"
  ]);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Logic that requires the game to be fully loaded (e.g., checking world versions)
  console.log("Trinity | System Ready");
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * 
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
Hooks.on("hotbarDrop", (bar, data, slot) => createTrinityMacro(data, slot));

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
