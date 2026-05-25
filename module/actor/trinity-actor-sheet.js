/**
 * Trinity Continuum Actor Sheet
 * Updated for Foundry V13 Compatibility, Gift Item Support, & Interactive Pips
 */

export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity-app", "sheet", "actor"], 
      template: "systems/trinity/templates/actor/trinity-actor-sheet_1.html",
      width: 800,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
    });
  }

  /** @override */
  get template() {
    if (this.actor.type === "npc") {
      return "systems/trinity/templates/actor/trinity-actor-sheet-npc_1.html";
    }
    return "systems/trinity/templates/actor/trinity-actor-sheet_1.html";
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;

    context.enrichedBiography = await TextEditor.enrichHTML(context.system.biography || "", {
      async: true,
      secrets: this.actor.isOwner,
      rollData: this.actor.getRollData()
    });

    context.enrichedNotes = await TextEditor.enrichHTML(context.system.gmNotes || "", {
      async: true,
      secrets: this.actor.isOwner,
      rollData: this.actor.getRollData()
    });

    if (actorData.type === 'character' || actorData.type === 'npc') {
      this._prepareItems(context);
    }

    return context;
  }

  /**
   * Sort items into their proper categories for the Handlebars partials.
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
    const contacts = [];
    const gifts = []; 

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
      else if (i.type === 'contact') contacts.push(i);
      else if (i.type === 'gift') gifts.push(i); 
    }

    context.gear = gear;
    context.weapons = weapons;
    context.armor = armor;
    context.edges = edges;
    context.paths = paths;
    context.powers = powers;
    context.conditions = conditions;
    context.bonds = bonds;
    context.contacts = contacts;
    context.gifts = gifts; 
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item) item.sheet.render(true);
    });

    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.roll-power').click(this._onItemRoll.bind(this));

    // Listen for clicks on the visual pips/dots
    html.find('.pip').click(this._onPipClick.bind(this));

    // Listen for clicks to add Health Boxes
    html.find('.add-health-box').click(this._onAddHealthBox.bind(this));
    
    // Listen for clicks to remove Health Boxes (Right-click)
    html.find('.add-health-box').contextmenu(this._onRemoveHealthBox.bind(this));
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = foundry.utils.duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = { name: name, type: type, system: data };
    
    delete itemData.system["type"];
    
    return await Item.create(itemData, {parent: this.actor});
  }

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

  /** Handle clicking on a pip/dot to set the value */
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

  /** Handle adding an extra Bruised or Injured box (Left-click) */
  _onAddHealthBox(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type; 
    const currentMax = this.document.system.health[type].max;
    return this.document.update({ [`system.health.${type}.max`]: currentMax + 1 });
  }

  /** Handle removing an extra Health box (Right-click) */
  _onRemoveHealthBox(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const currentMax = this.document.system.health[type].max;
    // Don't allow it to go below 0 max boxes
    if (currentMax > 0) {
      return this.document.update({ [`system.health.${type}.max`]: currentMax - 1 });
    }
  }
}
