export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520
    });
  }

  /** @override */
  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  /** @override */
  async getData(options) {
    // 1. Grab the default Foundry context (this automatically handles editable/owner states!)
    const context = await super.getData(options);
    
    // 2. Map system data cleanly
    context.system = context.item.system;
    context.flags = context.item.flags;

    // 3. Process the Rich Text Editor safely for V13
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

    const newValue = (currentValue === clickedIndex) ? clickedIndex - 1 : clickedIndex;
    
    return this.document.update({ [field]: newValue });
  }
}
