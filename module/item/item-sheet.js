/**
 * Trinity Continuum Item Sheet (Master)
 * V14 Compliant - Expanded Auto-Scaling Editors (400px) and Restored Tabs
 */

export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "item"],
      width: 520,
      height: 700, // <--- INCREASED: Taller default window to fit the larger text box
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

    context.editable = this.isEditable;
    context.owner = this.document.isOwner;

    // V14 REQUIRES explicitly enriched strings. Mirroring the working Actor sheet!
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
    
    // EXPANDED EDITOR FIX
    // Dynamically applies the CSS directly to the editor from the Javascript.
    // Prevents the 0-pixel collapse on new items and provides a larger 400px typing area.
    html.find('prose-mirror, .editor-content').css({
      'min-height': '400px', // <--- INCREASED: Doubled for easier reading and writing
      'display': 'block',
      'border': '1px solid #ccc',
      'border-radius': '5px',
      'padding': '5px',
      'background': 'rgba(0,0,0,0.02)'
    });

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
