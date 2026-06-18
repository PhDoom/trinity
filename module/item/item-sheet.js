/**
 * Trinity Continuum Item Sheet (Master)
 * Updated for Foundry V13 Compatibility
 */

export class TrinityItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 520,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  get template() {
    return `systems/trinity/templates/item/item-${this.item.type}-sheet.html`;
  }

  async getData(options) {
    const context = await super.getData(options);
    
    context.system = context.item.system;
    context.flags = context.item.flags;
    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // THE FIX: Feed the raw description to the V13 Handlebars editor helper.
    // This restores the text box for all older item templates without crashing!
    context.enrichedDescription = context.system.description || "";

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
