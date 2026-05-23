/**
 * Extend the base Combat entity for Trinity V13 initiative handling
 * @extends {Combat}
 */
export class TrinityCombat extends Combat {

  /** @override */
  async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {

    // Process either a single ID or an array of IDs
    const iterations = Array.isArray(ids) ? ids : [ids];
    
    for ( let id of iterations ) {
      // Find the combatant and their associated actor
      const combatant = this.combatants.get(id);
      if ( !combatant?.actor ) continue;

      const actor = combatant.actor;
      // V13 Migration: Access system data instead of data.data
      const system = actor.system;

      /*
       * Trinity Initiative Logic
       * We use actor.getRollData() to ensure all attributes (@attributes.cunning.value, etc.)
       * are correctly mapped via the fixes we made in trinity-actor.js.
       */
      const rollData = actor.getRollData();
      
      // Default to Cunning + 1d10 if no specific formula is provided
      const rollFormula = formula || `1d10 + ${system.attributes.cunning.value || 0}`;
      
      const roll = new Roll(rollFormula, rollData);
      
      // V13 Requirement: Roll evaluation is now asynchronous
      await roll.evaluate();

      // Update the combatant's initiative value in the tracker
      await this.updateEmbeddedDocuments("Combatant", [{
        _id: id,
        initiative: roll.total
      }]);

      // Generate the Chat Message for the initiative roll
      if ( messageOptions ) {
        const speaker = ChatMessage.getSpeaker({
          actor: actor,
          token: combatant.token,
          alias: combatant.name
        });

        const flavor = `${actor.name} rolls for Initiative!`;
        
        await roll.toMessage({
          speaker: speaker,
          flavor: flavor,
          ...messageOptions
        });
      }
    }

    return this;
  }
}
