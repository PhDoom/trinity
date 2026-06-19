/**
 * Trinity Continuum Item Sheet (Master)
 * V14 Compliant - Full Text Enrichment Restored
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520,
      // RESTORED: From Original Code to prevent display crashes on complex items[cite: 1]
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
    
    // Map system data cleanly[cite: 1]
    context.system = context.item.system;
    context.flags = context.item.flags;

    // Pass permissions so the editor knows it is allowed to open[cite: 1]
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // THE V14 FIX: Mirroring the working Actor sheet exactly!
    // V14 requires explicitly enriched strings. This replaces the 'REMOVED' comment from the original code.
    context.enrichedDescription = await TextEditor.enrichHTML(context.system.description || "", {
      async: true,
      secrets: this.document.isOwner,
      relativeTo: this.document
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
