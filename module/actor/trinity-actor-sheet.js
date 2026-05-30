/**
 * Trinity Continuum Actor Sheet (Base)
 * Updated for Foundry V13 Compatibility, Lowercase Schema & Interactive Pips
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
    
    // REQUIRED: Pass these permissions to the template for the editor to function
    context.owner = this.document.isOwner;
    context.editable = this.isEditable;
    
    const actorData = context.actor;
    context.system = actorData.system;
    context.flags = actorData.flags;

    // V13 Asynchronous ProseMirror Data
    context.enrichedBiography = await TextEditor.enrichHTML(context.system.biography || "", {
      async: true,
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    context.enrichedPlayerNotes = await TextEditor.enrichHTML(context.system.playerNotes || "", {
      async: true,
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    context.enrichedNotes = await TextEditor.enrichHTML(context.system.gmNotes || "", {
      async: true,
      secrets: this.actor.isOwner,
      relativeTo: this.actor
    });

    context.enrichedBonds = await TextEditor.enrichHTML(context.system.bonds || "", {
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
    const paths = []; 
    const powers = [];
    const conditions = [];
    const bonds = [];
    const contacts = [];
    const gifts = [];
    
    // Containers for our lowercase item types
    const quantumPowers = [];
    const biotech = [];
    const vehicles = [];
    const skillTricks = []; 

    // NEW Containers for Anima items
    const aspects = [];
    const buffs = [];
    const masteries = [];

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
      
      // Strict lowercase sorting to match the database!
      else if (i.type === 'quantumpower') quantumPowers.push(i);
      else if (i.type === 'biotech') biotech.push(i);
      else if (i.type === 'vehicle') vehicles.push(i);
      else if (i.type === 'skilltrick') skillTricks.push(i); 

      // Sort new Anima & Assassin Items
      else if (i.type === 'aspect') aspects.push(i);
      else if (i.type === 'buff') buffs.push(i);
      else if (i.type === 'mastery') masteries.push(i);
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
    
    context.quantumPowers = quantumPowers;
    context.biotech = biotech;
    context.vehicles = vehicles;
    context.skillTricks = skillTricks; 

    // Assign sorted items to the context
    context.aspects = aspects;
    context.buffs = buffs;
    context.masteries = masteries;
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
    html.find('.pip').click(this._onPipClick.bind(this));
  }

  /** Handle clicking on a pip/dot to set the actor's values */
  _onPipClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const field = element.parentElement.dataset.name;
    const currentValue = Number(element.parentElement.dataset.value);
    const clickedIndex = Number(element.dataset.index);

    const newValue = (currentValue === clickedIndex) ? clickedIndex - 1 : clickedIndex;
    
    return this.document.update({ [field]: newValue });
  }

  /** FIXED: Strict V13 Item Creation with Auto-Render */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;

    let name = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (type === "quantumpower") name = "New Quantum Power";
    if (type === "skilltrick") name = "New Skill Trick";

    const itemData = {
      name: name,
      type: type,
      system: {} 
    };
    
    return await this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true });
  }

  /** Unified Roll Method - Optimized for V13 Stability */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const { TrinityRollPrompt } = await import("../dice/trinity-roll-prompt.js");

    let rollName = "Action Roll";
    let defaultPool = 1;
    let enhancement = 0;

    const sys = this.actor.system || {};

    if (dataset.rollType === "item") {
      const li = $(element).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      if (item) {
        rollName = item.name;
        defaultPool = parseInt(item.system?.dicePool) || parseInt(item.system?.value) || 1;
      }
    }
    else if (dataset.attribute) {
      const attr = sys.attributes?.[dataset.attribute];
      rollName = attr?.label || dataset.attribute.capitalize();
      defaultPool = attr?.value || 1;
    } 
    else if (dataset.skill) {
      const skill = sys.skills?.[dataset.skill];
      rollName = skill?.label || dataset.skill.capitalize();
      defaultPool = skill?.value || 0;
    }
    // ---> NEW ANIMA ROLL LOGIC <---
    else if (dataset.animaStat) {
      const stat = sys.anima?.stats?.[dataset.animaStat];
      rollName = "Anima " + dataset.animaStat.charAt(0).toUpperCase() + dataset.animaStat.slice(1);
      defaultPool = stat?.value || 0;
    }
    else if (dataset.animaPath) {
      const path = sys.anima?.paths?.[dataset.animaPath];
      rollName = "Anima " + dataset.animaPath.charAt(0).toUpperCase() + dataset.animaPath.slice(1) + " Path";
      defaultPool = path?.rating || 0;
    }
    else if (dataset.animaSkill) {
      const skill = sys.anima?.skills?.[dataset.animaSkill];
      rollName = "Anima " + dataset.animaSkill.charAt(0).toUpperCase() + dataset.animaSkill.slice(1);
      defaultPool = skill?.value || 0;
    }
    // ---> END ANIMA ROLL LOGIC <---
    else if (dataset.traitName) {
      rollName = dataset.traitName;
      defaultPool = parseInt(dataset.traitValue) || 1;
    }
    else if (dataset.rollType === "initiative") {
      rollName = "Initiative";
      const poolA = (sys.skills?.athletics?.value || 0) + (sys.attributes?.cunning?.value || 1);
      const poolB = (sys.skills?.empathy?.value || 0) + (sys.attributes?.dexterity?.value || 1);
      defaultPool = Math.min(poolA, poolB);
      enhancement = parseInt(sys.initiative?.enhancement) || 0;
    }

    const config = await TrinityRollPrompt.confirmRoll(this.actor, { 
        name: rollName, 
        defaultPool: defaultPool,
        enhancement: enhancement 
    });
    
    if (config) {
        await TrinityRollPrompt.executeRoll(this.actor, config);
    }
  }
}
