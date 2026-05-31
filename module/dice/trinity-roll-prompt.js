/**
 * Trinity Roll Class & Prompt Dialog
 * Extended for Foundry V13 - Handles custom Trinity d10 logic,
 * dual dice pools, dynamic trait selection, and difficulty margin.
 */

export class TrinityRollPrompt {
    
    static async confirmRoll(actor, options = {}) {
        const targetNumber = actor.system.rollSettings?.targetNumber?.value || 8;
        const doubleSuccess = actor.system.rollSettings?.doubleSuccess?.value || 10;
        
        const initialPool1 = options.defaultPool || 0;
        const initialName = options.name || "Action";

        const template = `
        <form class="trinity-dialog roll-prompt" autocomplete="off" style="padding: 10px;">
          <header class="dialog-header border-bottom mb-2 flexrow flex-between" style="padding-bottom: 5px; margin-bottom: 10px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; align-items: center;">
            <h3 class="m-0" style="margin: 0;">Action Configuration</h3>
            <div class="pool-preview" style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px;">
              <span class="small-label" style="font-size: 0.8em; text-transform: uppercase;">Total Pool:</span> 
              <span class="text-blue font-weight-bold" id="total-pool-display" style="color: #2b6cb0; font-weight: bold; font-size: 1.2em;">${initialPool1}</span>
            </div>
          </header>

          <div class="flexrow flex-center mb-1" style="display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 10px;">
            <div class="flexcol flex-center border p-2" style="flex: 1; border-radius: 5px; background: rgba(0,0,0,0.02); text-align: center; border: 1px solid #cbd5e0; padding: 10px;">
              <label class="small-label font-weight-bold mb-1" style="display: block; font-size: 0.8em; text-transform: uppercase; margin-bottom: 5px;">Dice Pool 1</label>
              <input type="number" name="pool1" value="${initialPool1}" data-dtype="Number" class="text-center" style="width: 60px; font-size: 1.2em; font-weight: bold; text-align: center;"/>
              <div class="small mt-1 text-muted text-center" id="pool1-name" style="min-height: 15px; font-size: 0.85em; color: #718096; margin-top: 5px;">${initialName}</div>
            </div>

            <div class="font-weight-bold" style="font-size: 1.5em; color: #666;">+</div>

            <div class="flexcol flex-center border p-2" style="flex: 1; border-radius: 5px; background: rgba(0,0,0,0.02); text-align: center; border: 1px solid #cbd5e0; padding: 10px;">
              <label class="small-label font-weight-bold mb-1" style="display: block; font-size: 0.8em; text-transform: uppercase; margin-bottom: 5px;">Dice Pool 2</label>
              <input type="number" name="pool2" value="0" data-dtype="Number" class="text-center" style="width: 60px; font-size: 1.2em; font-weight: bold; text-align: center;"/>
              <div class="small mt-1 text-muted text-center" id="pool2-name" style="min-height: 15px; font-size: 0.85em; color: #718096; margin-top: 5px;">None</div>
            </div>
          </div>

          <div class="flexrow flex-center mb-2" style="margin-bottom: 15px;">
            <button type="button" class="select-pools-btn font-weight-bold" style="width: 100%; border: 1px solid #3182ce; background: #ebf8ff; color: #2b6cb0; padding: 5px; cursor: pointer;">
              <i class="fas fa-list-check"></i> Pool Selection
            </button>
          </div>

          <div class="modifiers-section border-top pt-2" style="border-top: 1px solid #ccc; padding-top: 10px;">
            <div class="grid grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="form-group flexcol flex-center" style="text-align: center;">
                <label class="small-label font-weight-bold" style="display: block; font-size: 0.85em;">Enhancement</label>
                <input type="number" name="enhancement" value="${options.enhancement || 0}" data-dtype="Number" class="text-center w-50 mb-2" style="width: 50%; text-align: center; margin-bottom: 10px;"/>
                <label class="small-label font-weight-bold" style="display: block; font-size: 0.85em; color: #2b6cb0;">+/- Die</label>
                <input type="number" name="bonusDice" value="0" data-dtype="Number" class="text-center w-50" style="width: 50%; text-align: center; border: 1px solid #3182ce;"/>
              </div>
              <div class="form-group flexcol flex-center" style="text-align: center;">
                <label class="small-label font-weight-bold" style="display: block; font-size: 0.85em;">Difficulty</label>
                <input type="number" name="difficulty" value="1" data-dtype="Number" class="text-center w-50" style="width: 50%; text-align: center;"/>
              </div>
            </div>
          </div>
        </form>
        `;

        return new Promise((resolve) => {
            new Dialog({
                title: `Action Roll`,
                content: template,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-dice-d20"></i>',
                        label: "Roll",
                        callback: (html) => {
                            const p1 = parseInt(html.find('[name="pool1"]').val()) || 0;
                            const p2 = parseInt(html.find('[name="pool2"]').val()) || 0;
                            const bd = parseInt(html.find('[name="bonusDice"]').val()) || 0;
                            const enh = parseInt(html.find('[name="enhancement"]').val()) || 0;
                            const diff = parseInt(html.find('[name="difficulty"]').val()) || 1;
                            
                            const finalPool = p1 + p2 + bd;
                            const p1Name = html.find('#pool1-name').text();
                            const p2Name = html.find('#pool2-name').text();
                            
                            let combinedName = options.name || "Action";
                            if (p1Name !== "None" && p2Name !== "None") combinedName = `${p1Name} + ${p2Name}`;
                            else if (p1Name !== "None") combinedName = p1Name;

                            resolve({ pool: finalPool, enhancement: enh, difficulty: diff, targetNumber, doubleSuccess, name: combinedName });
                        }
                    }
                },
                default: "roll"
            }).render(true);
        });
    }

    static async executeRoll(actor, config) {
        if (!config) return;

        const rollPool = Math.max(config.pool, 1);
        const roll = new Roll(`${rollPool}d10`);
        await roll.evaluate();

        const diceResults = roll.terms[0].results.map(r => r.result);
        let naturalSuccesses = 0;
        let ones = 0;

        diceResults.forEach(d => {
            if (d >= config.doubleSuccess) naturalSuccesses += 2;
            else if (d >= config.targetNumber) naturalSuccesses += 1;
            else if (d === 1) ones += 1;
        });

        let totalSuccesses = naturalSuccesses > 0 ? naturalSuccesses + config.enhancement : 0;
        let extraSuccesses = Math.max(0, totalSuccesses - config.difficulty);

        const chatContent = `
            <div style="border: 2px solid #333; padding: 10px; border-radius: 5px;">
                <h2 style="text-align: center; margin: 0 0 10px 0;">${config.name}</h2>
                <h3 style="text-align: center; color: ${totalSuccesses > 0 ? '#28a745' : '#dc3545'}; margin: 0;">
                    ${totalSuccesses} Success${totalSuccesses !== 1 ? 'es' : ''}
                </h3>
                <div style="text-align: center; border-top: 1px solid #ccc; margin-top: 10px; padding-top: 5px;">
                    <strong>Extra Successes:</strong> ${extraSuccesses}
                </div>
            </div>
        `;

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: chatContent,
            rolls: [roll]
        });
    }
}
