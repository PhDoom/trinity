/**
 * Extend the base Combat entity to handle Trinity-specific initiative
 * @extends {Combat}
 */
export class TrinityCombat extends Combat {

  /** @override */
  async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {

    // Process a single ID or an array of IDs
    const iterations = Array.isArray(ids) ? ids : [ids];
    
    for ( let id of iterations ) {
      // Find the combatant and associated actor
      const combatant = this.combatants.get(id);
      if ( !combatant?.actor ) continue;

      const actor = combatant.actor;
      // V13 Migration: Access system data instead of data.data
      const system = actor.system;

      // Prepare roll data via the updated TrinityActor class
      const rollData = actor.getRollData();
      
      // Default Trinity Initiative: 1d10 + Cunning
      // We use optional chaining to safely handle actors missing the Cunning attribute
      const rollFormula = formula || `1d10 + ${system.attributes?.cunning?.value || 0}`;
      
      const roll = new Roll(rollFormula, rollData);
      
      // V13 Requirement: Roll evaluation MUST be awaited
      await roll.evaluate();

      // Update the initiative score in the tracker
      await this.updateEmbeddedDocuments("Combatant", [{
        _id: id,
        initiative: roll.total
      }]);

      // Generate the chat card for the roll
      if ( messageOptions ) {
        const speaker = ChatMessage.getSpeaker({
          actor: actor,
          token: combatant.token,
          alias: combatant.name
        });

        await roll.toMessage({
          speaker: speaker,
          flavor: `${actor.name} rolls for Initiative!`,
          ...messageOptions
        });
      }
    }

    return this;
  }
}
