/**
 * Define a set of template paths to pre-load for Trinity Continuum V13.
 * Pre-loading allows for faster rendering by caching the HTML files.
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths
  const templatePaths = [
    // Actor Sheet Partials
    "systems/trinity/templates/actor/parts/actor-attributes.html",
    "systems/trinity/templates/actor/parts/actor-skills.html",
    "systems/trinity/templates/actor/parts/actor-health.html",
    "systems/trinity/templates/actor/parts/actor-items.html",
    
    // Trinity Sub-Type Partials (Talent, Mage, Psion, Nova)
    "systems/trinity/templates/actor/parts/actor-powers-talent.html",
    "systems/trinity/templates/actor/parts/actor-powers-mage.html",
    "systems/trinity/templates/actor/parts/actor-powers-psion.html",
    "systems/trinity/templates/actor/parts/actor-powers-nova.html",
    "systems/trinity/templates/actor/parts/actor-roll-settings.html",

    // Item Sheet Partials
    "systems/trinity/templates/item/parts/item-description.html",
    "systems/trinity/templates/item/parts/item-header.html",

    // Dialogs & UI
    "systems/trinity/templates/combat/focus-dialog.html",
    "systems/trinity/templates/chat/roll-card.html"
  ];

  // V13 Requirement: Return the promise of loadTemplates
  return loadTemplates(templatePaths);
};
