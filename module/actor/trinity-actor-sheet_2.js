/**
 * Trinity Continuum Actor Sheet (Variant 2)
 * Updated for Foundry V13 Compatibility & Modern Data Schema
 */

export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor", "v2"],
      width: 820,
      height: 850,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
    });
  }

  /** @override */
  get template() {
    // Dynamically route to the Variant 2 templates
    if (this.actor.type === "npc") {
      return "systems/trinity/templates/actor/trinity-actor-sheet-npc_2.html";
    }
    return "systems/trinity/templates/actor/trinity-actor-sheet_2.html";
  }

  /** @override */
  async getData(options) {
    // V13: Asynchronous data preparation
    const context = await super.getData(options);

    // Establish the 'system' shortcut to map to your V13 HTML inputs
    const actorData = context.actor;
    context.system = actorData.system;
    context.flags = actorData.flags;

    // V13: Asynchronous ProseMirror text enrichment
    context.enrichedBiography = await TextEditor.enrichHTML(context.system.biography || "", {
      async: true,
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    context.enrichedNotes = await TextEditor.enrichHTML(context.system.gmNotes || "", {
      async: true,
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    // Prepare character-specific item sorting for the inventory tab
    if (actorData.type === 'character' || actorData.type === 'npc') {
      this._prepareItems(context);
    }

    return context;
  }

  /**
   * Sort items into their proper categories
   * @param {Object} context The actor context object
   */
  _prepareItems(context) {
    const gear = [];
    const weapons = [];
    const armor = [];
    const edges = [];
    const paths = [];
    const powers = [];
    const conditions = [];
    const bonds = [];

    // V13: Iterate over the flat context.items array directly
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN; 
      
      if (i.type === 'gear' || i.type === 'item') gear.push(i);
      else if (i.type === 'weapon') weapons.push(i);
      else if (i.type === 'armor') armor.push(i);
      else if (i.type === 'edge') edges.push(i);
      else if (i.type === 'path') paths.push(i);
      else if (i.type === 'power' || i.type === 'action') powers.push(i);
      else if (i.type === 'condition') conditions.push(i);
      else if (i.type === 'bond') bonds.push(i);
    }

    // Assign back to context so the Handlebars partials can loop through them
    context.gear = gear;
    context.weapons = weapons;
    context.armor = armor;
    context.edges = edges;
    context.paths = paths;
    context.powers = powers;
    context.conditions = conditions;
    context.bonds = bonds;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // ---------------------------------------------------------
    // Document Management (V13 API)
    // ---------------------------------------------------------

    // Add Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Edit Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item) item.sheet.render(true);
    });

    // Delete Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      // V13: Mandatory change from deleteOwnedItem to deleteEmbeddedDocuments
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    // ---------------------------------------------------------
    // Roll Triggers
    // ---------------------------------------------------------

    // Attributes and Skills
    html.find('.rollable').click(this._onRoll.bind(this));
    
    // Powers and Items
    html.find('.roll-power').click(this._onItemRoll.bind(this));
  }

  /**
   * Create new embedded items
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = foundry.utils.duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = { name: name, type: type, system: data };
    
    delete itemData.system["type"];
    
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle attribute/skill rolls via the dynamically imported prompt
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const { TrinityRollPrompt } = await import("../dice/trinity-roll-prompt.js");

    if (dataset.attribute) {
      const val = this.actor.system.attributes[dataset.attribute]?.value || 0;
      const config = await TrinityRollPrompt.confirmRoll(this.actor, { name: dataset.attribute });
      await TrinityRollPrompt.executeRoll(this.actor, val, config);
    }
  }

  /**
   * Handle item/power rolls via the dynamically imported prompt
   */
  async _onItemRoll(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    
    if (item) {
      const { TrinityRollPrompt3 } = await import("../dice/trinity-roll-prompt3.js");
      const pool = item.system.dicePool || 0;
      const config = await TrinityRollPrompt3.confirmRoll(this.actor, { pool: pool, name: item.name });
      await TrinityRollPrompt3.executeRoll(this.actor, config);
    }
  }
}
