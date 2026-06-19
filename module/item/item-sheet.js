/**
 * Trinity Continuum Item Sheet (Master)
 * Built for V14 Native Web Component Architecture
 */

export class TrinityItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 600, // Height expanded to accommodate the permanent editor
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  async getData(options) {
    const context = await super.getData(options);
    
    context.system = this.item.system;
    context.flags = this.item.flags;
    context.editable = this.isEditable;
    context.owner = this.item.isOwner;

    // V14 Enrichment is required to initialize the ProseMirror Web Component properly
    context.enrichedDescription = await TextEditor.enrichHTML(this.item.system.description || "", {
      async: true,
      secrets: this.item.isOwner,
      relativeTo: this.item // Essential for parsing Drag-and-Drop UUID links
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
    
    return this.item.update({ [field]: newValue });
  }
}
