/**
 * Trinity Continuum Item Sheet (Master)
 * Restored to Original Logic (Tabs removed to prevent V13 render crashes)
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520
      // THE FIX: The crashing 'tabs' array has been completely removed from this block.
    });
  }

  /** @override - Route items dynamically based on their specific type! */
  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    
    // Restored your original, perfectly working data mapping
    context.system = context.item.system;
    context.flags = context.item.flags;

    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find('.pip').click(this._onPipClick.bind(this));
  }

  /** Handle clicking on a pip/dot to set the item's value */
  _onPipClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const field = element.parentElement.dataset.name;
    const currentValue = Number(element.parentElement.dataset.value);
    const clickedIndex = Number(element.dataset.index);

    const newValue = (currentValue === clickedIndex) ? clickedIndex - 1 : clickedIndex;
    
    return this.document.update({ [field]: newValue });
  }
}
