export const preloadHandlebarsTemplates = async function() {
  const templatePaths = [
    // NPC Partials
    "systems/trinity/templates/actor/partials-npc/npc-attributes.html",
    "systems/trinity/templates/actor/partials-npc/npc-edit.html",
    "systems/trinity/templates/actor/partials-npc/npc-main.html",
    "systems/trinity/templates/actor/partials-npc/npc-stats.html",

    // Character Partials
    "systems/trinity/templates/actor/partials/actions.html",
    "systems/trinity/templates/actor/partials/all-items.html",
    "systems/trinity/templates/actor/partials/armors.html",
    "systems/trinity/templates/actor/partials/attributes.html",
    "systems/trinity/templates/actor/partials/attributes_1.html",
    "systems/trinity/templates/actor/partials/bio.html",
    "systems/trinity/templates/actor/partials/bonds.html",
    "systems/trinity/templates/actor/partials/character.html",
    "systems/trinity/templates/actor/partials/combat.html",
    "systems/trinity/templates/actor/partials/conditions.html",
    "systems/trinity/templates/actor/partials/contacts.html",
    "systems/trinity/templates/actor/partials/defense.html",
    "systems/trinity/templates/actor/partials/defense_1.html",
    "systems/trinity/templates/actor/partials/edges.html",
    "systems/trinity/templates/actor/partials/edges_1.html",
    "systems/trinity/templates/actor/partials/facets.html",
    "systems/trinity/templates/actor/partials/full-data.html",
    "systems/trinity/templates/actor/partials/full-data_1.html",
    "systems/trinity/templates/actor/partials/gear.html",
    "systems/trinity/templates/actor/partials/gifts.html",
    "systems/trinity/templates/actor/partials/healthboxes.html",
    "systems/trinity/templates/actor/partials/healthboxes_1.html",
    "systems/trinity/templates/actor/partials/healthboxes_2.html",
    "systems/trinity/templates/actor/partials/healthboxes_3.html",
    "systems/trinity/templates/actor/partials/initiative.html",
    "systems/trinity/templates/actor/partials/initiative_1.html",
    "systems/trinity/templates/actor/partials/inspiration.html",
    "systems/trinity/templates/actor/partials/mage.html",
    "systems/trinity/templates/actor/partials/nova.html",
    "systems/trinity/templates/actor/partials/paths.html",
    "systems/trinity/templates/actor/partials/psi.html",
    "systems/trinity/templates/actor/partials/psi_1.html",
    "systems/trinity/templates/actor/partials/quintessence-paradox.html",
    "systems/trinity/templates/actor/partials/saved-rolls.html",
    "systems/trinity/templates/actor/partials/saved-rolls_1.html",
    "systems/trinity/templates/actor/partials/saved-rolls_2.html",
    "systems/trinity/templates/actor/partials/saved-rolls_3.html",
    "systems/trinity/templates/actor/partials/settings.html", // NEW: Settings Tab
    "systems/trinity/templates/actor/partials/skill-tricks.html", // NEW: Skill Tricks Section
    "systems/trinity/templates/actor/partials/skills.html",
    "systems/trinity/templates/actor/partials/specialties.html",
    "systems/trinity/templates/actor/partials/stunts.html",
    "systems/trinity/templates/actor/partials/talent.html",
    "systems/trinity/templates/actor/partials/temp-file.html",
    "systems/trinity/templates/actor/partials/tricks.html",
    "systems/trinity/templates/actor/partials/unflagged.html",
    "systems/trinity/templates/actor/partials/vehicles.html",
    "systems/trinity/templates/actor/partials/weapons.html"
  ];

  return loadTemplates(templatePaths);
};
