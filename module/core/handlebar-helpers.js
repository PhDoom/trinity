/**
 * Register custom Handlebars helpers for Trinity Continuum V13.
 */
export const registerHandlebarHelpers = function() {

  /**
   * Helper to check for equality.
   * Usage: {{#if (eq system.type "character")}} ... {{/if}}
   */
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  /**
   * Helper to capitalize strings.
   * Useful for dynamic labels in the UI.
   */
  Handlebars.registerHelper('capitalize', function(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * Helper to safely retrieve a value from a nested object.
   * Useful for dynamic attribute lookups.
   */
  Handlebars.registerHelper('getProperty', function(obj, path) {
    return getProperty(obj, path);
  });

  /**
   * Helper to determine wound penalties visually.
   * Usage: <div class="{{woundColor system.health.value system.health.max}}">
   */
  Handlebars.registerHelper('woundColor', function(current, max) {
    const percent = (current / max) * 100;
    if (percent <= 25) return 'critical';
    if (percent <= 50) return 'injured';
    return 'healthy';
  });

  /**
   * For V13 compatibility: A helper to log data to the console directly from Handlebars.
   * Extremely useful for debugging why a value isn't showing up on your sheet.
   * Usage: {{log system}}
   */
  Handlebars.registerHelper('log', function(context) {
    console.log("Handlebars Log:", context);
  });
};
