/**
 * Trinity Continuum Item Sheet (Master)
 * V14 Compliant - Cleaned for Native Handlebars Editor Support
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 700, // Kept the taller window for typing comfort
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override - Route items dynamically based on their specific type! */
  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    
    // Map system data cleanly
    context.system = context.item.system;
    context.flags = context.item.flags;

    // Pass permissions so the editor knows you are allowed to type
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // THE FIX: TextEditor.enrichHTML has been entirely removed.
    // By updating your HTML to use {{editor system.description...}}, 
    // Foundry V14 natively handles the rendering without requiring JS hacks!

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
