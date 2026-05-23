/**
 * Trinity Continuum Actor Overview (Alternate Version) for Foundry V13.
 * Focuses on Attribute and Skill summaries for the GM dashboard.
 */
export class TrinityOverview extends Application {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "trinity-overview-attr",
      title: "Crew Readiness Overview",
      template: "systems/trinity/templates/overview/overview_1.html",
      width: 800,
      height: "auto",
      resizable: true,
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "attributes" }]
    });
  }

  /** @override */
  async getData(options) {
    const actors = game.actors.contents
      .filter(a => a.type === "character" && (a.testUserPermission(game.user, "OBSERVER") || game.user.isGM))
      .map(actor => {
        const sys = actor.system;

        // Dynamic Resource Mapping based on restored template.json subTypes
        let resource = { label: "Inspiration", value: sys.talent?.inspiration?.value || 0 };
        if (sys.subType === "mage") resource = { label: "Quintessence", value: sys.mage?.quintessence?.value || 0 };
        if (sys.subType === "psion") resource = { label: "Psi", value: sys.psion?.psi?.value || 0 };
        if (sys.subType === "nova") resource = { label: "Quantum", value: sys.nova?.quantum?.value || 0 };

        return {
          id: actor.id,
          name: actor.name,
          img: actor.img,
          subType: sys.subType ? sys.subType.toUpperCase() : "TALENT",
          attributes: sys.attributes,
          health: sys.health,
          resource: resource
        };
      });

    return {
      actors: actors,
      isGM: game.user.isGM
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Open Actor Sheet on Name Click
    html.find('.actor-link').click(ev => {
      const actorId = ev.currentTarget.closest('.actor-row').dataset.actorId;
      game.actors.get(actorId)?.sheet.render(true);
    });

    // Roll Initiative for specific Actor from Overview
    html.find('.roll-init').click(async ev => {
      const actorId = ev.currentTarget.closest('.actor-row').dataset.actorId;
      const actor = game.actors.get(actorId);
      if (actor) await actor.rollInitiative({ createCombatants: true });
    });
  }
}
