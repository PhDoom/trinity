/**
 * Register custom hooks for Trinity Continuum V13.
 */
export const registerHooks = function() {

  /**
   * Hook into the initialization phase.
   */
  Hooks.once("init", async function() {
    console.log("Trinity | Initializing System Hooks");

    // Example: Configure status effects or global constants
    CONFIG.statusEffects = [
      ...CONFIG.statusEffects,
      // Add Trinity-specific statuses (Injured, Stunned, etc.) here
    ];
  });

  /**
   * Hook into the rendering of the actor sheet to add custom logic.
   */
  Hooks.on("renderActorSheet", (sheet, html, data) => {
    // V13 Migration: 'data' passed to the sheet already contains the flattened 'system' object
    // if you followed the changes in trinity-actor-sheet.js.
    
    // Example: Add a custom CSS class to the sheet based on the actor's type
    const actorType = sheet.actor.type;
    html.closest('.app').addClass(`type-${actorType}`);
  });

  /**
   * Handle sidebar rendering for specialized UI elements.
   */
  Hooks.on("renderSidebarTab", (app, html) => {
    if (app instanceof CombatTracker) {
      // Logic to customize the look of the combat tracker in V13
      const combatTracker = html.find("#combat-tracker");
      // console.log("Trinity | Customizing Combat Tracker UI");
    }
  });

  /**
   * Logic to run when an actor is created.
   * Useful for setting default tokens or initial health.
   */
  Hooks.on("createActor", async (actor, options, userId) => {
    if (game.user.id !== userId) return;

    // V13 Migration: Use the 'system' keypath for updates
    if (actor.type === "character") {
      await actor.update({
        "token.prototypeToken.actorLink": true,
        "token.prototypeToken.disposition": 1, // Friendly
        "system.health.value": actor.system.health?.max || 10
      });
    }
  });

  /**
   * Custom logic for dice rolls if using a specialized dice engine.
   */
  Hooks.on("renderChatMessage", (message, html, data) => {
    // Hide or format specific parts of the chat card for Trinity rolls
    if (message.flags?.trinity?.rollType) {
      html.addClass("trinity-roll-card");
    }
  });
};
