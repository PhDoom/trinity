/**
 * Trinity Continuum Actor Sheet (Variant 1)
 * Updated for Foundry V13 Compatibility & Contact List Support
 */

export class TrinityActorSheet extends ActorSheet {

  // ... (Keep existing static get defaultOptions and get template methods)

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
   * Sort items into their proper categories, including Contacts.
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
    const contacts = []; // 1. Initialized new container

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
      else if (i.type === 'contact') contacts.push(i); // 2. Added sorting logic
    }

    context.gear = gear;
    context.weapons = weapons;
    context.armor = armor;
    context.edges = edges;
    context.paths = paths;
    context.powers = powers;
    context.conditions = conditions;
    context.bonds = bonds;
    context.contacts = contacts; // 3. Assigned to context
  }

  // ... (Keep existing activateListeners, _onItemCreate, _onRoll, and _onItemRoll methods)
}
