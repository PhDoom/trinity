/**
 * Utility class for Trinity Health and Wound tracking in Foundry V13.
 */
export class TrinityHealth {
  
  /**
   * Adjusts the actor's current health.
   * @param {Actor} actor - The actor instance.
   * @param {number} amount - The amount to change (positive or negative).
   */
  static async adjustHealth(actor, amount) {
    const system = actor.system;
    
    // Calculate new value while staying within 0 and max
    const newHealth = Math.clamped(
      (system.health.value || 0) + amount, 
      0, 
      system.health.max || 0
    );

    // Update the actor using the V13 system keypath
    return await actor.update({
      "system.health.value": newHealth
    });
  }

  /**
   * Calculates the current wound penalty based on health levels.
   * Useful for systems where damage directly impacts dice pools.
   * @param {Actor} actor 
   * @returns {number}
   */
  static getWoundPenalty(actor) {
    const system = actor.system;
    const current = system.health.value;
    const max = system.health.max;

    // Logic for Trinity: As health drops, penalties increase.
    // This example assumes 0 health is fully incapacitated.
    if (current <= 0) return -4; 
    if (current <= Math.floor(max / 4)) return -2;
    if (current <= Math.floor(max / 2)) return -1;

    return 0;
  }

  /**
   * Reset health to max.
   * @param {Actor} actor 
   */
  static async fullyHeal(actor) {
    const max = actor.system.health.max || 0;
    return await actor.update({
      "system.health.value": max
    });
  }
}
