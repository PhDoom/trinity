/**
 * Register Trinity-specific game settings for Foundry V13.
 */
export const registerSettings = function() {

  // Setting to toggle specialized Trinity UI elements
  game.settings.register("trinity", "specializedUI", {
    name: "Enable Specialized UI",
    hint: "If enabled, the system will use Trinity-specific custom UI overlays.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: value => {
      // Modern V13 approach: Notify the UI that it may need a refresh
      if (ui.sidebar) ui.sidebar.render();
    }
  });

  // Example: Setting for wound penalty calculation style
  game.settings.register("trinity", "woundPenaltyStyle", {
    name: "Wound Penalty Style",
    hint: "Choose how wound penalties are applied to rolls.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "standard": "Standard (Flat Deduction)",
      "narrative": "Narrative (Threshold-based)",
      "none": "No Penalties"
    },
    default: "standard"
  });

  // Example: Setting for XP multiplier
  game.settings.register("trinity", "xpMultiplier", {
    name: "XP Multiplier",
    hint: "Multiply all XP rewards by this amount.",
    scope: "world",
    config: true,
    type: Number,
    default: 1
  });
};
