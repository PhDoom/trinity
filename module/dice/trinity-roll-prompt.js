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
          
          <hr style="margin: 10px 0;">
          <p style="text-align: center; color: #666; font-size: 0.9em; margin: 0;">
              Target Number: <strong>${targetNumber}</strong> | Double Success: <strong>${doubleSuccess}</strong>
          </p>
        </form>
        `;

        return new Promise((resolve) => {
            new Dialog({
                title: `Action Roll`,
                content: template,
                render: (html) => {
                    // Update Total Pool UI
                    const updatePool = () => {
                        const p1 = parseInt(html.find('[name="pool1"]').val()) || 0;
                        const p2 = parseInt(html.find('[name="pool2"]').val()) || 0;
                        const bd = parseInt(html.find('[name="bonusDice"]').val()) || 0;
                        html.find('#total-pool-display').text(p1 + p2 + bd);
                    };

                    html.find('[name="pool1"], [name="pool2"], [name="bonusDice"]').on('change keyup', updatePool);

                    // Pool Selection Button
                    html.find('.select-pools-btn').on('click', (e) => {
                        e.preventDefault();
                        this._openTraitSelector(actor, html, updatePool);
                    });
                },
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
                            else if (p2Name !== "None") combinedName = p2Name;

                            resolve({ pool: finalPool, enhancement: enh, difficulty: diff, targetNumber, doubleSuccess, name: combinedName });
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve(null)
                    }
                },
                default: "roll"
            }).render(true);
        });
    }

    /**
     * Isolated Trait Selector Logic to prevent scoping errors
     */
    static _openTraitSelector(actor, mainHtml, updatePoolCallback) {
        const currentP1Name = mainHtml.find('#pool1-name').text().toLowerCase();
        const currentP2Name = mainHtml.find('#pool2-name').text().toLowerCase();

        let traits = [];
        const sys = actor.system;
        
        // Build Data
        if (sys.attributes) {
            for (let [k, a] of Object.entries(sys.attributes)) traits.push({ name: a.label || k.charAt(0).toUpperCase() + k.slice(1), value: a.value || 0 });
        }
        if (sys.skills) {
            for (let [k, s] of Object.entries(sys.skills)) traits.push({ name: s.label || k.charAt(0).toUpperCase() + k.slice(1), value: s.value || 0 });
        }
        if (sys.nova?.quantum) traits.push({ name: "Quantum", value: sys.nova.quantum.value || 0 });
        if (sys.psion?.psi) traits.push({ name: "Psi", value: sys.psion.psi.value || 0 });
        if (sys.talent?.inspiration) traits.push({ name: "Inspiration", value: sys.talent.inspiration.value || 0 });
        if (sys.aethernaut?.inspiration) traits.push({ name: "Inspiration", value: sys.aethernaut.inspiration.value || 0 });
        if (sys.anima?.stats) {
            traits.push({ name: "Force", value: sys.anima.stats.force?.value || 0 });
            traits.push({ name: "Finesse", value: sys.anima.stats.finesse?.value || 0 });
            traits.push({ name: "Resilience", value: sys.anima.stats.resilience?.value || 0 });
        }
        
        actor.items.forEach(i => { 
            if (i.type === 'buff') traits.push({ name: i.name, value: i.system.rating || 0 });
            if (i.type === 'quantumpower') traits.push({ name: i.name, value: i.system.value || 0 });
        });

        traits.sort((a, b) => a.name.localeCompare(b.name));

        // Build HTML
        let listHtml = `
        <div style="max-height: 400px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid #ccc;">
                <th style="padding: 5px;">Select</th>
                <th style="padding: 5px;">Trait</th>
                <th style="padding: 5px; text-align: center;">Value</th>
              </tr>
            </thead>
            <tbody>`;
        
        traits.forEach(t => {
            const traitNameLower = t.name.toLowerCase();
            const isChecked = (traitNameLower === currentP1Name || traitNameLower === currentP2Name) ? "checked" : "";
            listHtml += `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 5px;"><input type="checkbox" class="trait-cb" data-name="${t.name}" data-value="${t.value}" ${isChecked}></td>
                <td style="padding: 5px;">${t.name}</td>
                <td style="padding: 5px; text-align: center; font-weight: bold;">${t.value}</td>
              </tr>`;
        });
        listHtml += `</tbody></table></div>`;

        // Render Dialog
        new Dialog({
            title: "Select up to 2 Traits",
            content: listHtml,
            render: (innerHtml) => {
                innerHtml.find('.trait-cb').on('change', function() {
                    if(innerHtml.find('.trait-cb:checked').length > 2) {
                        this.checked = false;
                        ui.notifications.warn("You can only select a maximum of 2 traits.");
                    }
                });
            },
            buttons: { 
                confirm: { 
                    label: "Confirm", 
                    icon: '<i class="fas fa-check"></i>',
                    callback: (inner) => {
                        const selected = inner.find('.trait-cb:checked');
                        
                        if (selected.length > 0) {
                            mainHtml.find('[name="pool1"]').val($(selected[0]).data('value'));
                            mainHtml.find('#pool1-name').text($(selected[0]).data('name'));
                        } else {
                            mainHtml.find('[name="pool1"]').val(0);
                            mainHtml.find('#pool1-name').text("None");
                        }
                        
                        if (selected.length > 1) {
                            mainHtml.find('[name="pool2"]').val($(selected[1]).data('value'));
                            mainHtml.find('#pool2-name').text($(selected[1]).data('name'));
                        } else {
                            mainHtml.find('[name="pool2"]').val(0);
                            mainHtml.find('#pool2-name').text("None");
                        }
                        
                        updatePoolCallback();
                    }
                }
            },
            default: "confirm"
        }).render(true);
    }

    /**
     * Executes the V13 roll, maps dice UI, and outputs to chat.
     */
    static async executeRoll(actor, config) {
        if (!config) return;

        const rollPool = Math.max(config.pool, 1);
        const roll = new Roll(`${rollPool}d10`);
        await roll.evaluate();

        let naturalSuccesses = 0;
        let diceHTML = `<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 10px;">`;
        
        roll.terms[0].results.forEach(r => {
            let val = r.result;
            let bgColor = "#eee";
            let borderColor = "#999";
            let color = "#333";

            if (val >= config.doubleSuccess) {
                naturalSuccesses += 2;
                bgColor = "#d4edda";
                borderColor = "#28a745";
                color = "#155724";
            } 
            else if (val >= config.targetNumber) {
                naturalSuccesses += 1;
                bgColor = "#cce5ff";
                borderColor = "#007bff";
                color = "#004085";
            } 
            else if (val === 1) {
                bgColor = "#f8d7da";
                borderColor = "#dc3545";
                color = "#721c24";
            }

            diceHTML += `<div style="padding: 5px 10px; border: 1px solid ${borderColor}; border-radius: 3px; background: ${bgColor}; color: ${color}; font-weight: bold; font-size: 1.2em;">${val}</div>`;
        });
        diceHTML += `</div>`;

        const totalSuccesses = naturalSuccesses > 0 ? naturalSuccesses + config.enhancement : 0;
        const extraSuccesses = Math.max(0, totalSuccesses - config.difficulty);

        const chatContent = `
            <div style="border: 2px solid #333; padding: 10px; border-radius: 5px; background: #fff;">
                <h2 style="text-align: center; margin: 0 0 10px 0;">${config.name}</h2>
                ${diceHTML}
                <h3 style="text-align: center; color: ${totalSuccesses > 0 ? '#28a745' : '#dc3545'}; margin: 0;">
                    ${totalSuccesses} Success${totalSuccesses !== 1 ? 'es' : ''}
                </h3>
                <div style="text-align: center; font-size: 0.85em; color: #666;">
                    ${config.enhancement > 0 ? `Enhancement: +${config.enhancement} | ` : ''} Difficulty: ${config.difficulty}
                </div>
                <div style="text-align: center; border-top: 1px solid #ccc; margin-top: 10px; padding-top: 5px; font-weight: bold;">
                    Extra Successes: ${extraSuccesses}
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
