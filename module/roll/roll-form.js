/**
 * Trinity Continuum Roll Form for Foundry V13.
 * Manages the logic for constructing complex dice pools from the UI.
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
      id: "trinity-roll-form",
      title: "Roll Dice Pool",
      template: "systems/trinity/templates/roll/roll-form.html",
      width: 400,
      height: "auto",
      closeOnSubmit: true
    });
  }

  /** @override */
  async getData(options) {
    const sys = this.actor.system;
    
    // V13: Pull defaults from the restored rollSettings in template.json
    return {
      actor: this.actor,
      system: sys,
      params: this.params,
      rollSettings: sys.rollSettings,
      // Fallbacks if rollSettings are missing
      targetNumber: sys.rollSettings?.targetNumber?.value ?? 8,
      difficulty: sys.rollSettings?.difficulty?.value ?? 0,
      bonusDice: sys.rollSettings?.bonusDice?.value ?? 0
    };
  }

  /** @override */
  async _updateObject(event, formData) {
    // Extract values from the form
    const attrValue = parseInt(formData.attributeValue) || 0;
    const skillValue = parseInt(formData.skillValue) || 0;
    const bonus = parseInt(formData.bonusDice) || 0;
    const tn = parseInt(formData.targetNumber) || 8;
    const diff = parseInt(formData.difficulty) || 0;

    const totalDice = attrValue + skillValue + bonus;

    // V13 Migration: Asynchronous Roll Construction
    const label = this.params.label || "Dice Pool";
    const formula = `${totalDice}d10cs>=${tn}`;
    
    const roll = new Roll(formula, this.actor.getRollData());
    
    // V13 Requirement: Must await evaluation before sending to chat
    await roll.evaluate();

    // Create Chat Message
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<b>${label}</b><br>Target: ${tn} | Difficulty: ${diff}`,
      flags: {
        "trinity.rollInfo": {
          difficulty: diff,
          successes: roll.total
        }
      }
    });

    return roll;
  }
}
