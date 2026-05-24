/**
 * Trinity Continuum Picker Utility for Foundry V13.
 * Handles the selection and highlighting of attributes/skills for dice pools.
 */
export class TrinityPicker {

  /**
   * Handle the selection of a trait on the character sheet.
   * @param {Event} event     The click event.
   * @param {Actor} actor     The actor owning the trait.
   */
  static async onPick(event, actor) {
    const element = event.currentTarget;
    const traitName = element.dataset.label;
    const traitValue = parseInt(element.dataset.value) || 0;
    const traitType = element.dataset.type; // e.g., 'attribute' or 'skill'

    // V13: Access internal roll settings via .system
    const sys = actor.system;
    
    // Toggle selection state
    const isSelected = element.classList.contains("selected");
    
    if (isSelected) {
      element.classList.remove("selected");
      this._clearSelection(actor, traitType);
    } else {
      // Clear previous selections of the same type
      const sheet = element.closest(".sheet");
      sheet.querySelectorAll(`[data-type="${traitType}"]`).forEach(el => el.classList.remove("selected"));
      
      element.classList.add("selected");
      this._updateActorPool(actor, traitType, traitName, traitValue);
    }
  }

  /**
   * Update the actor's hidden roll state.
   * V13 Requirement: Use actor.update() targeting the 'system' path.
   */
  static async _updateActorPool(actor, type, name, value) {
    const updateData = {};
    updateData[`system.rollSettings.${type}`] = { name: name, value: value };
    
    // This allows the sheet to "remember" what was clicked for the Roll Dialog
    return actor.update(updateData);
  }

  /**
   * Clear the selection when a trait is deselected.
   */
  static async _clearSelection(actor, type) {
    const updateData = {};
    updateData[`system.rollSettings.${type}`] = { name: "", value: 0 };
    return actor.update(updateData);
  }

  /**
   * Reset all selections (usually called after a roll is completed).
   */
  static async reset(actor, html) {
    html.find(".selected").removeClass("selected");
    return actor.update({
      "system.rollSettings.attribute": { name: "", value: 0 },
      "system.rollSettings.skill": { name: "", value: 0 }
    });
  }
}
