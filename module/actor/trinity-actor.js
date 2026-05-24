/**
 * Trinity Continuum Actor Logic
 * Updated for Foundry V13 Compatibility
 */

export class TrinityActor extends Actor {

  /** @override */
  prepareData() {
    // 1. Core initialization
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;
    const flags = actorData.flags.trinity || {};

    // 2. Map Sub-Type Pools (Talent, Mage, Psion, Nova)
    this._prepareSubtypeData(actorData);
    
    // 3. Derived Defense/Resilience (Optional: Add logic here if they are auto-calculated)
  }

  /**
   * Logic for specific Trinity splat types
   */
  _prepareSubtypeData(actorData) {
    const system = actorData.system;

    // Ensure rollSettings have safe defaults if not present
    if (!system.rollSettings) {
      system.rollSettings = {
        targetNumber: { value: 8 },
        doubleSuccess: { value: 10 },
        explodeThreshold: { value: 10 },
        successThreshold: { value: 0 },
        failThreshold: { value: 1 }
      };
    }

    // Logic based on subType
    if (system.subType === 'talent') {
      // Inspiration logic could go here
    } else if (system.subType === 'psion') {
      // Psi and Tolerance logic
    } else if (system.subType === 'nova') {
      // Quantum and Flux logic
    } else if (system.subType === 'mage') {
      // Arete and Quintessence logic
    }
  }

  /**
   * Helper to identify item types for macros or other scripts
   */
  getRollData() {
    const data = foundry.utils.duplicate(this.system);
    // Add any specific roll-related modifiers here
    return data;
  }
}
