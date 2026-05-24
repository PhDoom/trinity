/**
 * Trinity Continuum Actor Sheet
 * Fully Updated for Foundry V13 Compatibility
 */

export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
      // Default template, can be overridden by the template getter
      template: "systems/trinity/templates/actor/trinity-actor-sheet_1.html",
      width: 800,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
    });
  }

  /** @override */
  get template() {
    // Dynamically select the HTML file based on the actor's type
    if (this.actor.type === "npc") {
      return "systems/trinity/templates/actor/trinity-actor-sheet-npc_1.html";
    }
    return "systems/trinity/templates/actor/trinity-actor-sheet_1.html";
  }

  /** @override */
  async getData(options) {
    // V13 MANDATORY: getData must be asynchronous
    const context = await super.getData(options);

    // Create safe V13 references
    const actorData = context.actor;
    context.system = actorData.system;
    context.flags = actorData.flags;

    // V13: Asynchronous HTML Enrichment for ProseMirror editors
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

    // Prepare character-specific data (sorting inventory, powers, etc.)
    if (actorData.type === 'character' || actorData.type === 'npc') {
      this._prepareItems(context);
    }

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   * V13: Iterates over the context.items array
   * @param {Object} context The actor context object
   */
  _prepareItems(context) {
    // Initialize containers for the HTML partials
    const gear = [];
    const weapons = [];
    const armor = [];
    const edges = [];
    const paths = [];
    const powers = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      // Ensure image exists
      i.img = i.img || DEFAULT_TOKEN; 
      
      // Sort by type matching your template categories
      if (i.type === 'gear' || i.type === 'item') gear.push(i);
      else if (i.type === 'weapon') weapons.push(i);
      else if (i.type === 'armor') armor.push(i);
      else if (i.type === 'edge') edges.push(i);
      else if (i.type === 'path') paths.push(i);
      else if (i.type === 'power' || i.type === 'action') powers.push(i);
    }

    // Assign back to the context so Handlebars can loop through them
    context.gear = gear;
    context.weapons = weapons;
    context.armor = armor;
    context.edges = edges;
    context.paths = paths;
    context.powers = powers;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // If the sheet isn't editable (e.g., player viewing another player's sheet), skip binding controls
    if (!this.isEditable) return;

    // ---------------------------------------------------------
    // Item Management
    // ---------------------------------------------------------

    // Add New Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Edit Existing Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      // V13: Must use deleteEmbeddedDocuments, not deleteOwnedItem
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    // ---------------------------------------------------------
    // Roll Triggers
    // ---------------------------------------------------------

    // Attributes and Skills (from npc-attributes.html & others)
    html.find('.rollable').click(this._onRoll.bind(this));
    
    // Powers and Items (from the NPC actions list)
    html.find('.roll-power').click(this._onItemRoll.bind(this));
  }

  /**
   * Handle creating a new item from the sheet
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = { name: name, type: type, system: data };
    
    // Remove the type from the dataset since it's already in the itemData object
    delete itemData.system["type"];
    
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle basic attribute/skill rolls
   * Integrated with your V13 TrinityRollPrompt
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // V13: Dynamic import to avoid circular dependencies
    const { TrinityRollPrompt } = await import("../dice/trinity-roll-prompt.js");

    // Check if the click came from an attribute
    if (dataset.attribute) {
      const val = this.actor.system.attributes[dataset.attribute].value;
      const config = await TrinityRollPrompt.confirmRoll(this.actor, { name: dataset.attribute });
      await TrinityRollPrompt.executeRoll(this.actor, val, config);
    }
    // You can add an 'else if (dataset.skill)' here if needed
  }

  /**
   * Handle Item/Power Rolls
   * Integrated with your V13 TrinityRollPrompt3
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
