/**
 * Trinity Roll Class & Prompt Dialog
 * Extended for Foundry V13 - Handles custom Trinity d10 logic,
 * dual dice pools, and dynamic trait selection.
 */

export class TrinityRollPrompt {
    
    /**
     * Spawns the dialog box for the player to confirm their pool, select traits, and add Enhancements.
     */
    static async confirmRoll(actor, options = {}) {
        const targetNumber = actor.system.rollSettings?.targetNumber?.value || 8;
        const doubleSuccess = actor.system.rollSettings?.doubleSuccess?.value || 10;
        
        // Default initial pool values based on what was clicked on the character sheet
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
                <input type="number" name="difficulty" value="0" data-dtype="Number" class="text-center w-50" style="width: 50%; text-align: center;"/>
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
                    // Helper function to update the Total Pool UI live
                    const updatePool = () => {
                        const p1 = parseInt(html.find('[name="pool1"]').val()) || 0;
                        const p2 = parseInt(html.find('[name="pool2"]').val()) || 0;
                        const bd = parseInt(html.find('[name="bonusDice"]').val()) || 0;
                        html.find('#total-pool-display').text(p1 + p2 + bd);
                    };

                    html.find('[name="pool1"], [name="pool2"], [name="bonusDice"]').on('change keyup', updatePool);

                    // Handle Pool Selection Button
                    html.find('.select-pools-btn').click(async (e) => {
                        e.preventDefault();
                        
                        // Grab whatever is currently sitting in Pool 1 and Pool 2
                        const currentP1Name = html.find('#pool1-name').text().toLowerCase();
                        const currentP2Name = html.find('#pool2-name').text().toLowerCase();

                        // Gather all relevant traits dynamically
                        let traits = [];
                        const sys = actor.system;
                        
                        // 1. Attributes
                        if (sys.attributes) {
                            for (let [key, attr] of Object.entries(sys.attributes)) {
                                traits.push({ name: attr.label || key.charAt(0).toUpperCase() + key.slice(1), value: attr.value || 0 });
                            }
                        }
                        // 2. Skills
                        if (sys.skills) {
                            for (let [key, skill] of Object.entries(sys.skills)) {
                                traits.push({ name: skill.label || key.charAt(0).toUpperCase() + key.slice(1), value: skill.value || 0 });
                            }
                        }
                        // 3. Paradigm Traits (Quantum, Psi, Inspiration) - omitting Flux/Transcendence/Divergence
                        if (sys.nova?.quantum) traits.push({ name: "Quantum", value: sys.nova.quantum.value || 0 });
                        if (sys.psion?.psi) traits.push({ name: "Psi", value: sys.psion.psi.value || 0 });
                        if (sys.talent?.inspiration) traits.push({ name: "Inspiration", value: sys.talent.inspiration.value || 0 });
                        if (sys.aethernaut?.inspiration) traits.push({ name: "Inspiration", value: sys.aethernaut.inspiration.value || 0 });
                        
                        // 4. Anima Stats
                        if (sys.anima?.stats) {
                            traits.push({ name: "Force", value: sys.anima.stats.force?.value || 0 });
                            traits.push({ name: "Finesse", value: sys.anima.stats.finesse?.value || 0 });
                            traits.push({ name: "Resilience", value: sys.anima.stats.resilience?.value || 0 });
                        }
                        
                        // 5. Items (Buffs & Quantum Powers)
                        actor.items.forEach(item => {
                            if (item.type === 'buff') {
                                traits.push({ name: item.name, value: item.system.rating || 0 });
                            }
                            if (item.type === 'quantumpower') {
                                traits.push({ name: item.name, value: item.system.value || 0 });
                            }
                        });

                        // Sort Alphabetically
                        traits.sort((a, b) => a.name.localeCompare(b.name));

                        // Build Selection HTML Table
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
                            // SMART CHECK: Pre-check the box if it matches what is already in Pool 1 or Pool 2
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

                        // Spawn secondary dialog
                        new Dialog({
                            title: "Select up to 2 Traits",
                            content: listHtml,
                            render: (innerHtml) => {
                                // Enforce max 2 checkboxes
                                innerHtml.find('.trait-cb').on('change', function() {
                                    if(innerHtml.find('.trait-cb:checked').length > 2) {
                                        this.checked = false;
                                        ui.notifications.warn("You can only select a maximum of 2 traits.");
                                    }
                                });
                            },
                            buttons: {
                                confirm: {
                                    icon: '<i class="fas fa-check"></i>',
                                    label: "Confirm Selection",
                                    callback: (innerHtml) => {
                                        const selected = innerHtml.find('.trait-cb:checked');
                                        
                                        // Map first selection to Pool 1
                                        if (selected.length > 0) {
                                            const t1 = $(selected[0]);
                                            html.find('[name="pool1"]').val(t1.data('value'));
                                            html.find('#pool1-name').text(t1.data('name'));
                                        } else {
                                            html.find('[name="pool1"]').val(0);
                                            html.find('#pool1-name').text("None");
                                        }
                                        
                                        // Map second selection to Pool 2
                                        if (selected.length > 1) {
                                            const t2 = $(selected[1]);
                                            html.find('[name="pool2"]').val(t2.data('value'));
                                            html.find('#pool2-name').text(t2.data('name'));
                                        } else {
                                            html.find('[name="pool2"]').val(0);
                                            html.find('#pool2-name').text("None");
                                        }
                                        
                                        updatePool();
                                    }
                                }
                            },
                            default: "confirm"
                        }).render(true);
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
                            
                            const finalPool = p1 + p2 + bd;
                            
                            const p1Name = html.find('#pool1-name').text();
                            const p2Name = html.find('#pool2-name').text();
                            
                            let combinedName = options.name || "Action";
                            if (p1Name !== "None" && p2Name !== "None") {
                                combinedName = `${p1Name} + ${p2Name}`;
                            } else if (p1Name !== "None") {
                                combinedName = p1Name;
                            } else if (p2Name !== "None") {
                                combinedName = p2Name;
                            }

                            resolve({ pool: finalPool, enhancement: enh, targetNumber, doubleSuccess, name: combinedName });
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
     * Executes the V13 roll, calculates Storypath mechanics, and outputs to chat.
     */
    static async executeRoll(actor, config) {
        if (!config) return;

        // Ensure minimum 1 die even if pool is 0 or negative
        const rollPool = Math.max(config.pool, 1);
        const roll = new Roll(`${rollPool}d10`);
        await roll.evaluate();

        const diceResults = roll.terms[0].results.map(r => r.result);
        let naturalSuccesses = 0;
        let ones = 0;

        let diceHTML = `<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 10px;">`;

        diceResults.forEach(d => {
            let bgColor = "#eee";
            let borderColor = "#999";
            let color = "#333";

            if (d >= config.doubleSuccess) {
                naturalSuccesses += 2;
                bgColor = "#d4edda";
                borderColor = "#28a745";
                color = "#155724";
            } 
            else if (d >= config.targetNumber) {
                naturalSuccesses += 1;
                bgColor = "#cce5ff";
                borderColor = "#007bff";
                color = "#004085";
            } 
            else if (d === 1) {
                ones += 1;
                bgColor = "#f8d7da";
                borderColor = "#dc3545";
                color = "#721c24";
            }

            diceHTML += `<div style="padding: 5px 10px; border: 1px solid ${borderColor}; border-radius: 3px; background: ${bgColor}; color: ${color}; font-weight: bold; font-size: 1.2em;">${d}</div>`;
        });

        diceHTML += `</div>`;

        let isBotch = (naturalSuccesses === 0 && ones > 0);
        let totalSuccesses = naturalSuccesses > 0 ? naturalSuccesses + config.enhancement : 0;

        let resultText = "";
        let headerColor = "#333";

        if (isBotch) {
            resultText = `<h3 style="color: #dc3545; text-align: center; border-top: 1px solid #dc3545; padding-top: 5px; margin: 0;">BOTCH!</h3>`;
            headerColor = "#dc3545";
        } else if (naturalSuccesses === 0) {
            resultText = `<h3 style="color: #666; text-align: center; border-top: 1px solid #666; padding-top: 5px; margin: 0;">Failure</h3>`;
        } else {
            resultText = `<h3 style="color: #28a745; text-align: center; border-top: 1px solid #28a745; padding-top: 5px; margin: 0;">${totalSuccesses} Success${totalSuccesses !== 1 ? 'es' : ''}</h3>`;
            headerColor = "#28a745";
            if (config.enhancement > 0) {
                resultText += `<p style="text-align: center; font-size: 0.9em; margin: 2px 0 0 0; color: #666;">(Includes +${config.enhancement} Enhancement)</p>`;
            }
        }

        const chatContent = `
            <div class="trinity-roll" style="border: 2px solid ${headerColor}; padding: 10px; border-radius: 5px; background: rgba(0,0,0,0.02);">
                <h2 style="margin-top: 0; margin-bottom: 10px; text-align: center; color: ${headerColor}; border: none; font-size: 1.4em;">${config.name}</h2>
                ${diceHTML}
                ${resultText}
            </div>
        `;

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: chatContent,
            rolls: [roll]
        });
    }
}
