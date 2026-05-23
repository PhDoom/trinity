/**
 * Extend the basic ItemSheet with Trinity-specific logic for V13.
 * @extends {ItemSheet}
 */
export class TrinityItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "item"],
      template: "systems/trinity/templates/item/item-sheet.html",
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    // V13 Requirement: Use super.getData() to get the base document data
    const context = await super.getData(options);
    const itemData = context.item;

    // Map system data to a top-level property for easy Handlebars access
    context.system = itemData.system;
    context.config = CONFIG.TRINITY; // If you have global config constants

    // Add labels or extra formatting for specific item types
    context.isWeapon = itemData.type === 'weapon';
    context.isArmor = itemData.type === 'armor';
    context.isStunt = itemData.type === 'stunt';

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Example: Handle a "Roll" button click on a weapon or power
    html.find('.item-roll').click(ev => {
      // Use the roll logic from the Item document class we updated
      this.item.roll();
    });
  }
}
