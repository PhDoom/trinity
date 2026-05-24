/**
 * Trinity Continuum Roll Form (Version 2) for Foundry V13.
 * Optimized for quick-selection rolls and pool modification.
 */
export class TrinityRollForm extends FormApplication {

  constructor(actor, options, params) {
    super(actor, options);
    this.actor = actor;
    this.params = params;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "trinity-roll-form-v2",
      title: "Dice Pool Builder",
      template: "systems/trinity/templates/roll/roll-form_2.html",
      width: 420,
      height: "auto",
      closeOnSubmit: true
    });
  }

  /** @override */
  async getData(options) {
    const sys = this.actor.system;

    // V13 Migration: Access data via .system
    // Ensuring sub-type specific pools (like Inspiration) are available to the form
    return {
      actor: this.actor,
      system: sys,
      params: this.params,
      rollSettings: sys.rollSettings,
      // Default pool values from the Actor's current state
      targetNumber: sys.rollSettings?.targetNumber?.value ?? 8,
      difficulty: sys.rollSettings?.difficulty?.value ?? 0,
      bonusDice: sys.rollSettings?.bonusDice?.value ?? 0
    };
  }

  /** @override */
  async _updateObject(event, formData) {
    const sys = this.actor.system;
    
    // Extract data from the form
    const pool = parseInt(formData.pool) || 0;
    const bonus = parseInt(formData.bonusDice) || 0;
    const tn = parseInt(formData.targetNumber) || 8;
    const diff = parseInt(formData.difficulty) || 0;

    const totalDice = pool + bonus;
    const label = this.params.label || "Quick Roll";

    // V13 Requirement: Success counting syntax
    // cs>=X marks successes in the chat log
    const formula = `${totalDice}d10cs>=${tn}`;
    const roll = new Roll(formula, this.actor.getRollData());

    // V13 Migration: Asynchronous evaluation is mandatory
    await roll.evaluate();

    // Create the Chat Message
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `
        <div class="trinity-chat-card">
          <b>${label}</b><br>
          Pool: ${totalDice} | TN: ${tn} | Diff: ${diff}
        </div>
      `,
      flags: {
        "trinity.rollMetadata": {
          totalDice: totalDice,
          tn: tn,
          difficulty: diff,
          successes: roll.total
        }
      }
    });

    return roll;
  }
}
