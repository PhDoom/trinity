/**
 * Trinity Continuum Item Sheet (Master)
 * Restored with Raw String Injection to Bypass V13 ProseMirror Crashes
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520,
      // RESTORED: Tabs array is required so item-sheet.html doesn't hide the editor[cite: 1]
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

    // Ensure permissions allow the editor to open and accept text[cite: 1]
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // THE FIX: Provide the raw description string instead of leaving it undefined.
    // This feeds the "always open" editor exactly what it needs to mount the typing cursor 
    // WITHOUT triggering the V13 async registry crash.
    context.enrichedDescription = context.system.description || "";

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
