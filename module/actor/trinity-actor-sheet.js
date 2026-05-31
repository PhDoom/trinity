/**
 * Trinity Continuum Actor Sheet
 * Finalized for NPC Unified Sheet, Paradigm Logic & Deviation Support
 */

export class TrinityActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
      template: "systems/trinity/templates/actor/trinity-actor-sheet_1.html",
      width: 800,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "character" }]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    context.owner = this.document.isOwner;
    context.editable = this.isEditable;
    context.system = context.actor.system;

    // V13 Rich Text Enrichment
    context.enrichedBiography = await TextEditor.enrichHTML(context.system.biography || "", {
      async: true, secrets: this.actor.isOwner, relativeTo: this.actor
    });

    if (context.actor.type === 'character' || context.actor.type === 'npc') {
      this._prepareItems(context);
    }
    return context;
  }

  _prepareItems(context) {
    const categories = {
      gear: [], weapons: [], armor: [], edges: [], paths: [], powers: [], 
      conditions: [], bonds: [], contacts: [], gifts: [], quantumPowers: [], 
      biotech: [], vehicles: [], skillTricks: [], aspects: [], buffs: [], 
      masteries: [], deviations: [] // Added deviations
    };

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (categories[i.type]) categories[i.type].push(i);
      else if (i.type === 'gear' || i.type === 'item') categories.gear.push(i);
      else if (i.type === 'power' || i.type === 'action') categories.powers.push(i);
    }

    Object.assign(context, categories);
  }

  // ... (Keep your existing activateListeners, _onPipClick, _onItemCreate, and _onRoll methods here) ...
}

export class TrinityNPCSheet extends TrinityActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor", "npc"],
      template: "systems/trinity/templates/actor/trinity-actor-sheet-npc_1.html",
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }
}
