/**
 * Register custom Handlebars helpers for Trinity Continuum V13.
 */
export const registerHandlebarHelpers = function() {

  /**
   * Simple equality check helper.
   * Usage: {{#if (eq system.type "character")}}
   */
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  /**
   * Check if a value is greater than another.
   * Usage: {{#if (gt system.health.value 0)}}
   */
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  /**
   * For Trinity Dice Pools: Determine if a specific rating should be "checked" 
   * in a radio-button or dot-style display.
   */
  Handlebars.registerHelper('atLeast', function(value, threshold) {
    return value >= threshold;
  });

  /**
   * Math helper for calculating derived UI values.
   * Usage: {{math system.health.max "-" system.health.value}}
   */
  Handlebars.registerHelper('math', function(v1, operator, v2, options) {
    v1 = parseFloat(v1);
    v2 = parseFloat(v2);
    switch (operator) {
      case "+": return v1 + v2;
      case "-": return v1 - v2;
      case "*": return v1 * v2;
      case "/": return v1 / v2;
      case "%": return v1 % v2;
      default: return v1;
    }
  });

  /**
   * Debugging helper to inspect the V13 data object in the console.
   * Usage: {{log system}}
   */
  Handlebars.registerHelper('log', function(context) {
    console.log("Trinity | Handlebars Debug:", context);
  });

  /**
   * Helper to format labels from keys (e.g., "might" -> "Might").
   */
  Handlebars.registerHelper('capitalize', function(str) {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });
};
