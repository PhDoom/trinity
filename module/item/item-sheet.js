export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520
      // TABS REMOVED: Items are now a clean, single-page layout
    });
  }

  /** @override */
  get template() {
    // This dynamically fetches the HTML file based on the exact item type
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const itemData = this.item.toObject(false);
    
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Explicitly pass permissions so the Text Editor knows to unlock
    context.editable = this.isEditable;
    context.owner = this.item.isOwner;

    context.enrichedDescription = await TextEditor.enrichHTML(context.system.description || "", {
      async: true,
      secrets: this.item.isOwner,
      rollData: this.item.getRollData()
    });

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Listen for clicks on the visual pips/dots inside the ITEM sheet
    html.find('.pip').click(this._onPipClick.bind(this));
  }

  /** Handle clicking on a pip/dot to set the item's value */
  _onPipClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const field = element.parentElement.dataset.name;
    const currentValue = Number(element.parentElement.dataset.value);
    const clickedIndex = Number(element.dataset.index);

    // If clicking the current value, reduce it by 1 (allows setting to 0)
    const newValue = (currentValue === clickedIndex) ? clickedIndex - 1 : clickedIndex;
    
    return this.document.update({ [field]: newValue });
  }
}
