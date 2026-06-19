/**
 * Trinity Continuum Item Sheet (Master)
 * Restored to perfect working order (Tabs removed to fix Editor crash)
 */

export class TrinityItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520
      // THE FIX: The 'tabs' line was completely removed from here.
    });
  }

  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  async getData(options) {
    const context = await super.getData(options);
    
    context.system = this.document.system;
    context.flags = this.document.flags;
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // Restore the original enrichment so your HTML files get the data they expect
    context.enrichedDescription = await TextEditor.enrichHTML(this.document.system.description || "", {
      async: true,
      secrets: this.document.isOwner,
      relativeTo: this.document
    });

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find('.pip').click(this._onPipClick.bind(this));
  }

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
