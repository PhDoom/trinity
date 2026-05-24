/**
 * Trinity Continuum System for Foundry VTT v13
 */

// Import Modules
import { TrinityActor } from "./actor/trinity-actor.js";
import { TrinityActorSheet } from "./actor/trinity-actor-sheet.js";
import { TrinityItem } from "./item/item.js";
import { TrinityItemSheet } from "./item/item-sheet.js";
import { TRoll } from "./roll/troll.js";
import { extendPrototypes } from "./protos.js";

/* -------------------------------------------- */
/*  Initialization Hook                         */
/* -------------------------------------------- */

Hooks.once('init', async function() {
  console.log("Trinity | Initializing Trinity Continuum System (v13)");

  // 1. Create System Namespace
  game.trinity = {
    TrinityActor,
    TrinityItem,
    rollItemMacro,
    TRoll
  };

  // 2. Set Initiative Formula
  // V13 prefers pulling from the system object directly
  CONFIG.Combat.initiative = {
    formula: "1d20 + @attributes.dexterity.value", 
    decimals: 2
  };

  // 3. Document Class Registration (Updated for V13)
  CONFIG.Actor.documentClass = TrinityActor;
  CONFIG.Item.documentClass = TrinityItem;

  // 4. Custom Roll Registration
  // unshift puts TRoll at the front of the evaluation chain
  CONFIG.Dice.rolls.unshift(TRoll);

  // 5. Register Sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("trinity", TrinityActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("trinity", TrinityItemSheet, { makeDefault: true });

  // 6. Extend Helper Prototypes
  extendPrototypes();

  // 7. Handlebars Helpers
  Handlebars.registerHelper('concat', function() {
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str ? str.toLowerCase() : "";
  });

  Handlebars.registerHelper('toDots', function(n) {
    let dots = '';
    const filled = '<i class="fa fa-circle"></i>';
    const empty = '<i class="far fa-circle"></i>';
    if (n > 10) {
      dots = `${n} ${filled}`;
    } else {
      for (let i = 0; i < Math.max(n, 5); i++) {
        if (i === 5) dots += ' ';
        dots += (i < n) ? filled : empty;
      }
    }
    return new Handlebars.SafeString(dots);
  });

  Handlebars.registerHelper('to10Dots', function(n) {
    let dots = '';
    const filled = '<i class="fa fa-circle"></i>';
    const empty = '<i class="far fa-circle"></i>';
    if (n > 10) {
      dots = `${n} ${filled}`;
    } else {
      for (let i = 0; i < 10; i++) {
        dots += (i < n) ? filled : empty;
      }
    }
    return new Handlebars.SafeString(dots);
  });

  Handlebars.registerHelper('to10Boxes', function(n) {
    let dots = '';
    const filled = '<i class="fas fa-square"></i>';
    const empty = '<i class="far fa-square"></i>';
    for (let i = 0; i < 10; i++) {
      dots += (i < n) ? filled : empty;
    }
    return new Handlebars.SafeString(dots);
  });

  Handlebars.registerHelper('toHealthBoxes', function(h) {
    let boxes = '';
    const extraBox = '<i class="fas fa-plus-square"></i>';
    const filledBox = '<i class="fas fa-square"></i>';
    const emptyBox = '<i class="far fa-square"></i>';
    if (!h) return "";
    for (let i = 0; i < (h.filled || 0); i++) { boxes += filledBox; }
    for (let i = 0; i < (h.empty || 0); i++) { boxes += emptyBox; }
    for (let i = 0; i < (h.extra || 0); i++) { boxes += extraBox; }
    return new Handlebars.SafeString(boxes);
  });

  // 8. Preload Templates
  loadTrinityTemplates();
});

/* -------------------------------------------- */
/*  Ready & Logic Hooks                         */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createTrinityMacro(data, slot));
});

/* -------------------------------------------- */
/*  Template Loading                            */
/* -------------------------------------------- */

async function loadTrinityTemplates() {
  const templatePaths = [
    "systems/trinity/templates/actor/partials/full-data.html",
    "systems/trinity/templates/actor/partials/bio.html",
    "systems/trinity/templates/actor/partials/character.html",
    "systems/trinity/templates/actor/partials/attributes.html",
    "systems/trinity/templates/actor/partials/healthboxes.html",
    "systems/trinity/templates/actor/partials/skills.html",
    "systems/trinity/templates/actor/partials/inspiration.html",
    "systems/trinity/templates/actor/partials/all-items.html",
    "systems/trinity/templates/actor/partials-npc/npc-attributes.html",
    "systems/trinity/templates/actor/partials-npc/npc-edit.html"
  ];
  return loadTemplates(templatePaths);
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

async function createTrinityMacro(data, slot) {
  if (data.type !== "Item") return;
  // V13: Item data is stored in the .system property
  const item = data.uuid ? await fromUuid(data.uuid) : null;
  if (!item || !item.parent) return ui.notifications.warn("Macros can only be created for owned Items");

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

function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trinity V13 rolls are asynchronous
  return item.roll();
}
