/**
 * Trinity Continuum Actor Sheet (Variant 1)
 * Updated for Foundry V13 Compatibility, New Items & Interactive Pips
 */

export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
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
    const actorData = context.actor;
    context.system = actorData.system;
    context.flags = actorData.flags;

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
    const paths = []; // Legacy paths (kept safe just in case old items exist)
    const powers = [];
    const conditions = [];
    const bonds = [];
    const contacts = [];
    const gifts = [];
    
    // Containers for our recently created item types
    const quantumPowers = [];
    const biotech = [];
    const vehicles = [];
    const skillTricks = []; // NEW: Skill Tricks container

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
      
      // Sorting logic for new item types
      else if (i.type === 'quantumPower') quantumPowers.push(i);
      else if (i.type === 'biotech') biotech.push(i);
      else if (i.type === 'vehicle') vehicles.push(i);
      else if (i.type === 'skillTrick') skillTricks.push(i); // Sorting logic for Skill Tricks
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
    
    // Assigned back to context so HTML can loop through them
    context.quantumPowers = quantumPowers;
    context.biotech = biotech;
    context.vehicles = vehicles;
    context.skillTricks = skillTricks; // Assigned to context
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

    // UNIFIED ROLL LISTENER
    html.find('.rollable').click(this._onRoll.bind(this));
    
    // Listen for clicks on the visual pips/dots directly on the Actor sheet
    html.find('.pip').click(this._onPipClick.bind(this));
  }

  /** Handle clicking on a pip/dot to set the actor's values */
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

  /** Unified Roll Method handling Attributes, Skills, Items, and Traits */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const { TrinityRollPrompt } = await import("../dice/trinity-roll-prompt.js");

    let rollName = "Action Roll";
    let defaultPool = 1;

    // 1. Check if an Item (like a Psi Power or Quantum Power) was clicked
    if (dataset.rollType === "item") {
      const li = $(element).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item) {
        rollName = item.name;
        defaultPool = parseInt(item.system.dicePool) || parseInt(item.system.value) || 1;
      }
    }
    // 2. Check if an Attribute was clicked
    else if (dataset.attribute) {
      rollName = this.actor.system.attributes[dataset.attribute]?.label || dataset.attribute.capitalize();
      defaultPool = this.actor.system.attributes[dataset.attribute]?.value || 1;
    } 
    // 3. Check if a Skill was clicked
    else if (dataset.skill) {
      rollName = this.actor.system.skills[dataset.skill]?.label || dataset.skill.capitalize();
      defaultPool = this.actor.system.skills[dataset.skill]?.value || 0;
    }
    // 4. Check if a generic Trait (Quantum, PSI Rating) was clicked
    else if (dataset.traitName) {
      rollName = dataset.traitName;
      defaultPool = parseInt(dataset.traitValue) || 1;
    }

    const config = await TrinityRollPrompt.confirmRoll(this.actor, { name: rollName, defaultPool: defaultPool });
    await TrinityRollPrompt.executeRoll(this.actor, config);
  }
}
