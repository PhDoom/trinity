/**
 * Extend the basic ActorSheet with modifications for V13 compatibility
 * @extends {ActorSheet}
 */
export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
      template: "systems/trinity/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data from the parent class
    const context = super.getData();

    // V13 Migration: Use the 'system' property instead of 'data.data'
    const actorData = context.actor.system;
    
    // Pass the system data directly to the template context
    context.system = actorData;
    context.flags = context.actor.flags;
    context.config = CONFIG.TRINITY;

    // Prepare character items (gear, talents, etc.)
    if (this.actor.type === 'character' || this.actor.type === 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for formula resolution
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   * @param {Object} context The context object to mutate.
   */
  _prepareItems(context) {
    // Initialize item containers
    const gear = [];
    const weapons = [];
    const armor = [];
    const talents = [];
    const stunts = [];

    // Iterate through all items owned by the actor
    for (let i of context.items) {
      // Access the item's system data (V13 standard)
      const itemSystem = i.system;
      i.img = i.img || DEFAULT_TOKEN;

      // Assign to specific lists based on item type
      if (i.type === 'item') gear.push(i);
      else if (i.type === 'weapon') weapons.push(i);
      else if (i.type === 'armor') armor.push(i);
      else if (i.type === 'talent') talents.push(i);
      else if (i.type === 'stunt') stunts.push(i);
    }

    // Assign categorized items back to the context for Handlebars to see
    context.gear = gear;
    context.weapons = weapons;
    context.armor = armor;
    context.talents = talents;
    context.stunts = stunts;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Editable-only listeners
    if (!this.options.editable) return;

    // Item Creation
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Item Editing
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Item Deletion
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const itemId = li.data("itemId");
      this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // Handle Rolls
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      system: {} // Initialize with empty system data
    };
    return await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle clickable rolls.
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }
}
