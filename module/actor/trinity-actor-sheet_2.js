/**
 * Extend the basic ActorSheet for Trinity V13
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
    // Retrieve base data structure from Foundry
    const context = super.getData();

    // V13 Migration: Access the 'system' property directly
    const actorData = context.actor.system;
    
    // Create a flattened context for the Handlebars template
    context.system = actorData;
    context.flags = context.actor.flags;
    context.config = CONFIG.TRINITY;

    // Prepare character items (gear, weapons, etc.)
    if (this.actor.type === 'character' || this.actor.type === 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for formula resolution in sheets
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   * @param {Object} context The context object to mutate for the template.
   */
  _prepareItems(context) {
    // Initialize categorized containers
    const gear = [];
    const weapons = [];
    const armor = [];
    const talents = [];
    const stunts = [];

    // Iterate through items using the V13 item.system path
    for (let i of context.items) {
      const itemSystem = i.system;
      i.img = i.img || DEFAULT_TOKEN;

      // Sort items into tabs
      if (i.type === 'item') gear.push(i);
      else if (i.type === 'weapon') weapons.push(i);
      else if (i.type === 'armor') armor.push(i);
      else if (i.type === 'talent') talents.push(i);
      else if (i.type === 'stunt') stunts.push(i);
    }

    // Assign back to context
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

    // Only apply editable listeners if the user has permission
    if (!this.options.editable) return;

    // Item Creation
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Item Editing
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Item Deletion - Using V13 deleteEmbeddedDocuments
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const itemId = li.data("itemId");
      this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // Handle clickable rolls
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
      system: {} 
    };
    return await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle clickable rolls from the sheet.
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
