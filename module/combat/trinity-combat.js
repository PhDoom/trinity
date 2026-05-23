/**
 * Extend the base Combat entity to handle Trinity-specific initiative
 * @extends {Combat}
 */
export class TrinityCombat extends Combat {

  /** @override */
  async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {

    // Structure the initiative roll for each combatant
    const iterations = Array.isArray(ids) ? ids : [ids];
    for ( let id of iterations ) {

      // Get the combatant
      const combatant = this.combatants.get(id);
      if ( !combatant?.actor ) continue;

      // V13 Migration: Access system data instead of data.data
      const actor = combatant.actor;
      const system = actor.system;

      // Determine the initiative formula
      // Trinity typically uses Cunning + a d10 or similar logic
      const rollFormula = formula || `1d10 + ${system.attributes.cunning.value || 0}`;
      
      // Get roll data from our updated TrinityActor class
      const rollData = actor.getRollData();
      const roll = new Roll(rollFormula, rollData);
      
      // Evaluate the roll
      await roll.evaluate();

      // Update the combatant with the result
      await this.updateEmbeddedDocuments("Combatant", [{
        _id: id,
        initiative: roll.total
      }]);

      // Create a chat message for the roll
      if ( messageOptions ) {
        await roll.toMessage({
          speaker: ChatMessage.getSpeaker({
            actor: actor,
            token: combatant.token,
            alias: combatant.name
          }),
          flavor: `${actor.name} rolls for Initiative!`,
          ...messageOptions
        });
      }
    }

    // Return the updated combat instance
    return this;
  }
}
