// Import Modules
import { TrinityActor } from "./actor/trinity-actor.js";
import { TrinityActorSheet } from "./actor/trinity-actor-sheet.js";
import { TrinityItem } from "./item/trinity-item.js";
import { TrinityItemSheet } from "./item/trinity-item-sheet.js";
import { TrinityCombat } from "./combat/trinity-combat.js";
import { registerSettings } from "./core/game-settings.js";
import { registerHandlebarHelpers } from "./core/handlebar-helpers.js";
import { registerHooks } from "./core/hooks.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  console.log('Trinity | Initializing Trinity Continuum System');

  // 1. Register Core Logic & Listeners
  registerSettings();
  registerHandlebarHelpers();
  registerHooks(); // <--- Connects the hooks.js file we just updated

  // 2. Map Custom Classes to CONFIG (V13 Requirement)
  CONFIG.Actor.documentClass = TrinityActor;
  CONFIG.Item.documentClass = TrinityItem;
  CONFIG.Combat.documentClass = TrinityCombat;

  // 3. Register Sheet Application Classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("trinity", TrinityActorSheet, { makeDefault: true });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("trinity", TrinityItemSheet, { makeDefault: true });

  // 4. Pre-load HTML Templates
  return loadTemplates([
    "systems/trinity/templates/actor/actor-sheet.html",
    "systems/trinity/templates/item/item-sheet.html",
    "systems/trinity/templates/combat/focus-dialog.html"
  ]);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log("Trinity | System Ready for Action");
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on("hotbarDrop", (bar, data, slot) => createTrinityMacro(data, slot));

async function createTrinityMacro(data, slot) {
  if (data.type !== "Item") return;
  const item = data.uuid ? await fromUuid(data.uuid) : data.data;

  // V13 Migration: Use the safer fromUuid lookup for macro items
  if (!item) return ui.notifications.warn("Could not find the selected Item.");

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
