/**
 * Trinity Continuum Roll Form (Alternate) for Foundry V13.
 * Manages complex dice pool construction with specific attribute/skill pairing.
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
      id: "trinity-roll-form-alt",
      title: "Trinity Roll Builder",
      template: "systems/trinity/templates/roll/roll-form_1.html",
      width: 450,
      height: "auto",
      closeOnSubmit: true
    });
  }

  /** @override */
  async getData(options) {
    const sys = this.actor.system;

    // V13 Migration: Access data via .system
    // This pulls the persistent settings we restored in template.json
    return {
      actor: this.actor,
      system: sys,
      params: this.params,
      attributes: sys.attributes,
      skills: sys.skills,
      // Default roll values from the Actor's rollSettings
      targetNumber: sys.rollSettings?.targetNumber?.value ?? 8,
      doubleSuccess: sys.rollSettings?.doubleSuccess?.value ?? 10,
      difficulty: sys.rollSettings?.difficulty?.value ?? 0
    };
  }

  /** @override */
  async _updateObject(event, formData) {
    // Collect values from the form data
    const attrValue = parseInt(formData.attrValue) || 0;
    const skillValue = parseInt(formData.skillValue) || 0;
    const bonus = parseInt(formData.bonusDice) || 0;
    const tn = parseInt(formData.targetNumber) || 8;
    const ds = parseInt(formData.doubleSuccess) || 10;
    const diff = parseInt(formData.difficulty) || 0;

    const poolSize = attrValue + skillValue + bonus;
    const label = this.params.label || "Custom Roll";

    // V13 Requirement: Success counting syntax
    // cs>=X marks successes; we handle "Double Success" via chat flavor or custom roll logic
    const formula = `${poolSize}d10cs>=${tn}`;
    const roll = new Roll(formula, this.actor.getRollData());

    // V13 Migration: Evaluation is now asynchronous
    await roll.evaluate();

    // Create Chat Message
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `
        <div class="trinity-roll-flavor">
          <b>${label}</b><br>
          Pool: ${poolSize} | Target: ${tn} | Double: ${ds}+<br>
          Difficulty: ${diff}
        </div>
      `,
      flags: {
        "trinity.rollData": {
          pool: poolSize,
          tn: tn,
          ds: ds,
          difficulty: diff,
          successes: roll.total
        }
      }
    });

    return roll;
  }
}
