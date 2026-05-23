/**
 * Trinity Continuum Actor Overview for Foundry V13.
 * Provides a summarized view of all player characters.
 */
export class TrinityOverview extends Application {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "trinity-overview",
      title: "Actor Overview",
      template: "systems/trinity/templates/overview/overview.html",
      width: 600,
      height: "auto",
      resizable: true
    });
  }

  /** @override */
  async getData(options) {
    // V13: Use game.actors.contents to get the array of actors
    const actors = game.actors.contents
      .filter(a => a.type === "character" && (a.testUserPermission(game.user, "OBSERVER") || game.user.isGM))
      .map(actor => {
        const sys = actor.system;
        
        // Dynamic data extraction based on Trinity subTypes
        let powerPool = { label: "N/A", value: 0 };
        if (sys.subType === "talent") powerPool = { label: "Inspiration", value: sys.talent?.inspiration?.value };
        if (sys.subType === "mage") powerPool = { label: "Quintessence", value: sys.mage?.quintessence?.value };
        if (sys.subType === "psion") powerPool = { label: "Psi", value: sys.psion?.psi?.value };
        if (sys.subType === "nova") powerPool = { label: "Quantum", value: sys.nova?.quantum?.value };

        return {
          id: actor.id,
          name: actor.name,
          img: actor.img,
          subType: sys.subType ? sys.subType.charAt(0).toUpperCase() + sys.subType.slice(1) : "None",
          health: sys.health,
          power: powerPool
        };
      });

    return {
      actors: actors
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Click to open actor sheet
    html.find('.actor-name').click(ev => {
      const actorId = ev.currentTarget.closest('.actor-row').dataset.actorId;
      const actor = game.actors.get(actorId);
      actor?.sheet.render(true);
    });

    // GM-only: Refresh the data
    html.find('.refresh-overview').click(() => this.render(true));
  }
}
