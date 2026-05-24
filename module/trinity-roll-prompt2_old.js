/**
 * Trinity Continuum Roll Prompt
 * Updated for Foundry V13 and integrated with the TrinityPicker.
 */

export class TrinityRollPrompt {

  /**
   * Display the Dialog to confirm roll parameters.
   */
  static async confirmRoll(actor, item) {
    const sys = actor.system;
    
    // V13: Pull saved states from the rollSettings we restored
    const settings = sys.rollSettings || {};
    const savedAttr = settings.attribute?.name || "";
    const savedSkill = settings.skill?.name || "";
    
    // Default numerical values
    const tn = settings.targetNumber?.value ?? 8;
    const diff = settings.difficulty?.value ?? 0;
    const bonus = settings.bonusDice?.value ?? 0;

    // 1. Build Selection Lists (Auto-select based on Picker)
    let attrOptions = "";
    for (let [key, attr] of Object.entries(sys.attributes || {})) {
      const isSelected = savedAttr === key ? "selected" : "";
      attrOptions += `<option value="${key}" ${isSelected}>${attr.label} (${attr.value})</option>`;
    }

    let skillOptions = '<option value="none">None (0)</option>';
    for (let [key, skill] of Object.entries(sys.skills || {})) {
      const isSelected = savedSkill === key ? "selected" : "";
      skillOptions += `<option value="${key}" ${isSelected}>${skill.label} (${skill.value})</option>`;
    }

    // 2. Construct HTML safely for V13 Dialogs
    const content = `
      <form class="trinity-roll-prompt">
        <div class="form-group">
          <label>Attribute:</label>
          <select id="attr-select">${attrOptions}</select>
        </div>
        <div class="form-group">
          <label>Skill:</label>
          <select id="skill-select">${skillOptions}</select>
        </div>
        <hr>
        <div class="form-group">
          <label>Bonus Dice:</label>
          <input type="number" id="bonus-input" value="${bonus}">
        </div>
        <div class="form-group">
          <label>Target Number:</label>
          <input type="number" id="tn-input" value="${tn}">
        </div>
        <div class="form-group">
          <label>Difficulty:</label>
          <input type="number" id="diff-input" value="${diff}">
        </div>
      </form>
    `;

    // 3. Render Dialog
    return new Promise((resolve) => {
      new Dialog({
        title: `Roll: ${item ? item.name : actor.name}`,
        content: content,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Roll",
            callback: (html) => {
              resolve({
                attrKey: html.find('#attr-select').val(),
                skillKey: html.find('#skill-select').val(),
                bonusDice: parseInt(html.find('#bonus-input').val()) || 0,
                targetNumber: parseInt(html.find('#tn-input').val()) || 8,
                difficulty: parseInt(html.find('#diff-input').val()) || 0
              });
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }).render(true);
    });
  }

  /**
   * Execute the Roll asynchronously (V13 Requirement)
   */
  static async executeRoll(actor, config) {
    if (!config) return; // User cancelled

    const sys = actor.system;
    
    // Resolve values
    const attr = sys.attributes[config.attrKey];
    const skill = config.skillKey !== "none" ? sys.skills[config.skillKey] : { value: 0, label: "None" };
    
    const poolSize = attr.value + skill.value + config.bonusDice;
    
    // Construct V13 Formula
    const formula = `${poolSize}d10cs>=${config.targetNumber}`;
    const roll = new Roll(formula, actor.getRollData());
    
    // MANDATORY V13: Await evaluation
    await roll.evaluate();

    // Calculate Net Successes
    const netSuccesses = roll.total - config.difficulty;

    // Send to Chat with Metadata Flags
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `
        <div class="trinity-chat-card">
          <b>${attr.label} + ${skill.label !== "None" ? skill.label : ""}</b><br>
          Pool: ${poolSize} | Target: ${config.targetNumber} | Diff: ${config.difficulty}<br>
          <strong>Net Successes: ${netSuccesses}</strong>
        </div>
      `,
      flags: {
        "trinity.rollMetadata": {
          pool: poolSize,
          tn: config.targetNumber,
          difficulty: config.difficulty,
          grossSuccesses: roll.total,
          netSuccesses: netSuccesses
        }
      }
    });

    // Reset the Picker highlight on the character sheet
    await actor.update({
      "system.rollSettings.attribute.name": "",
      "system.rollSettings.skill.name": ""
    });

    return roll;
  }
}
