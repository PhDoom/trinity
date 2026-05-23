/**
 * Register custom Handlebars helpers for Trinity Continuum V13.
 */
export const registerHandlebarHelpers = function() {

  /**
   * Simple equality check.
   * Usage: {{#if (eq system.type "character")}}
   */
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  /**
   * Helper to create a loop for a specific number of times.
   * Essential for rendering dots/pips for Attributes and Skills.
   * Usage: {{#times 5}} ... {{/times}}
   */
  Handlebars.registerHelper('times', function(n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  /**
   * Check if a current index is less than a value.
   * Used inside a {{#times}} loop to determine if a dot is "filled".
   * Usage: {{#if (lt index ../value)}}
   */
  Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });

  /**
   * Helper to capitalize string keys for UI labels.
   */
  Handlebars.registerHelper('capitalize', function(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * V13 Debugging Helper.
   * Prints the current Handlebars context to the browser console.
   */
  Handlebars.registerHelper('log', function(context) {
    console.log("Trinity Handlebars Context:", context);
  });

  /**
   * Logic to safely handle deep object lookups in the system object.
   */
  Handlebars.registerHelper('getProperty', function(obj, path) {
    return getProperty(obj, path);
  });
};
