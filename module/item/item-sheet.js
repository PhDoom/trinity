/**
 * Trinity Continuum Item Sheet (Master)
 * Restored to perfect working order with V13 Native Editor paths
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
    
    // Map system data cleanly
    context.system = context.item.system;
    context.flags = context.item.flags;

    // Pass permissions so the editor knows you are allowed to type in it
    context.editable = this.isEditable;
    context.owner = this.item.isOwner;

    // THE FIX: Use the native V13 TextEditor path to silence warnings 
    // and restore the 'enrichedDescription' data your items are expecting!
    const EditorClass = foundry.applications?.ui?.TextEditor?.Implementation || TextEditor;
    
    context.enrichedDescription = await EditorClass.enrichHTML(context.system.description || "", {
      async: true,
      secrets: this.item.isOwner,
      rollData: this.item.getRollData(),
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
    
    return this.item.update({ [field]: newValue });
  }
}
