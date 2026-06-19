/**
 * Trinity Continuum Item Sheet (Master)
 * Updated for Foundry V13 Compatibility - Text Editor Restored
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520,
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

    // REQUIRED: Pass these permissions to the template for the editor to function
    context.owner = this.document.isOwner;
    context.editable = this.isEditable;

    const itemData = context.item;
    context.system = itemData.system;
    context.flags = itemData.flags;

    // V13 Asynchronous ProseMirror Data
    // THE FIX: Exactly mirroring the Actor Sheet's working logic!
    context.enrichedDescription = await TextEditor.enrichHTML(context.system.description || "", {
      async: true,
      secrets: this.item.isOwner,
      relativeTo: this.item
    });

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
