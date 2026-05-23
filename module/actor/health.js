/**
 * Utility class for managing Trinity health logic in V13.
 */
export class TrinityHealth {
  
  /**
   * Calculate derived health stats or handle health adjustments.
   * @param {Actor} actor - The actor instance whose health is being processed.
   */
  static updateHealth(actor) {
    // Access the system data using the V13 property
    const system = actor.system;

    // Example logic: Ensure health doesn't exceed its maximum
    // If you have specific Trinity health levels (Bruised, Injured, etc.), 
    // this is where you would process those status effects.
    if (system.health.value > system.health.max) {
      system.health.value = system.health.max;
    }

    // You can add more complex logic here, such as calculating 
    // wound penalties based on the current health value.
  }

  /**
   * Get the current wound penalty for an actor based on their health levels.
   * @param {Actor} actor 
   * @returns {Number} The penalty to be applied to rolls.
   */
  static getWoundPenalty(actor) {
    const system = actor.system;
    
    // Placeholder logic for Trinity wound penalties:
    // If health is low, return a penalty (e.g., -1 or -2).
    if (system.health.value <= (system.health.max / 4)) return -2;
    if (system.health.value <= (system.health.max / 2)) return -1;
    
    return 0;
  }
}
