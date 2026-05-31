/**
 * Trinity Roll Class & Prompt Dialog
 * Extended for Foundry V13 - Handles custom Trinity d10 logic,
 * dual dice pools, dynamic trait selection, and difficulty margin.
 */

export class TrinityRollPrompt {
    static async confirmRoll(actor, options = {}) {
        const targetNumber = actor.system.rollSettings?.targetNumber?.value || 8;
        const doubleSuccess = actor.system.rollSettings?.doubleSuccess?.value || 10;
        
        const template = `
        <form class="trinity-dialog roll-prompt" autocomplete="off" style="padding: 10px;">
          <header class="dialog-header border-bottom mb-2 flexrow flex-between" style="padding-bottom: 5px; margin-bottom: 10px; border-bottom: 1px solid #ccc; display: flex; justify-content: space-between; align-items: center;">
            <h3 class="m-0">Action Configuration</h3>
            <div class="pool-preview" style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px;">
              <span class="small-label">Total Pool:</span> 
              <span class="text-blue font-weight-bold" id="total-pool-display" style="font-size: 1.2em;">${options.defaultPool || 0}</span>
            </div>
          </header>

          <div class="flexrow flex-center mb-1" style="display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 10px;">
            <div class="flexcol flex-center border p-2" style="flex: 1; text-align: center; border: 1px solid #cbd5e0; padding: 10px;">
              <label class="small-label font-weight-bold mb-1">Dice Pool 1</label>
              <input type="number" name="pool1" value="${options.defaultPool || 0}" class="text-center" style="width: 60px;"/>
              <div class="small mt-1 text-muted" id="pool1-name">${options.name || "None"}</div>
            </div>
            <div class="font-weight-bold">+</div>
            <div class="flexcol flex-center border p-2" style="flex: 1; text-align: center; border: 1px solid #cbd5e0; padding: 10px;">
              <label class="small-label font-weight-bold mb-1">Dice Pool 2</label>
              <input type="number" name="pool2" value="0" class="text-center" style="width: 60px;"/>
              <div class="small mt-1 text-muted" id="pool2-name">None</div>
            </div>
          </div>

          <button type="button" class="select-pools-btn" style="width: 100%; margin-bottom: 10px;"><i class="fas fa-list-check"></i> Pool Selection</button>

          <div class="modifiers-section border-top pt-2">
            <div class="grid grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <label class="small-label">Enhancement</label>
                <input type="number" name="enhancement" value="${options.enhancement || 0}" class="text-center w-50"/>
              </div>
              <div>
                <label class="small-label">Difficulty</label>
                <input type="number" name="difficulty" value="1" class="text-center w-50"/>
              </div>
            </div>
          </div>
        </form>
        `;

        return new Promise((resolve) => {
            const dialog = new Dialog({
                title: "Action Roll",
                content: template,
                render: (html) => {
                    // Re-bind the click listener using the html instance passed by the render callback
                    html.find('.select-pools-btn').on('click', (e) => {
                        e.preventDefault();
                        this._openTraitSelector(actor, html);
                    });

                    // Live update total pool
                    const updatePool = () => {
                        const p1 = parseInt(html.find('[name="pool1"]').val()) || 0;
                        const p2 = parseInt(html.find('[name="pool2"]').val()) || 0;
                        html.find('#total-pool-display').text(p1 + p2);
                    };
                    html.find('[name="pool1"], [name="pool2"]').on('change keyup', updatePool);
                },
                buttons: {
                    roll: { label: "Roll", callback: (html) => {
                        resolve({ 
                            pool: (parseInt(html.find('[name="pool1"]').val()) || 0) + (parseInt(html.find('[name="pool2"]').val()) || 0),
                            enhancement: parseInt(html.find('[name="enhancement"]').val()) || 0,
                            difficulty: parseInt(html.find('[name="difficulty"]').val()) || 1,
                            name: html.find('#pool1-name').text() + " + " + html.find('#pool2-name').text(),
                            targetNumber, doubleSuccess
                        });
                    }}
                }
            });
            dialog.render(true);
        });
    }

    static _openTraitSelector(actor, mainHtml) {
        let traits = [];
        const sys = actor.system;
        if (sys.attributes) Object.entries(sys.attributes).forEach(([k, a]) => traits.push({ name: a.label || k, value: a.value || 0 }));
        if (sys.skills) Object.entries(sys.skills).forEach(([k, s]) => traits.push({ name: s.label || k, value: s.value || 0 }));
        actor.items.forEach(i => { if (i.type === 'buff' || i.type === 'quantumpower') traits.push({ name: i.name, value: i.system.rating || i.system.value || 0 }); });

        new Dialog({
            title: "Select Traits",
            content: `<div style="max-height: 300px; overflow-y: auto;">${traits.map(t => `<div style="padding: 5px;"><input type="checkbox" class="trait-cb" data-name="${t.name}" data-value="${t.value}"> ${t.name} (${t.value})</div>`).join('')}</div>`,
            buttons: { confirm: { label: "Confirm", callback: (inner) => {
                const selected = inner.find('.trait-cb:checked');
                mainHtml.find('[name="pool1"]').val(selected[0] ? $(selected[0]).data('value') : 0);
                mainHtml.find('#pool1-name').text(selected[0] ? $(selected[0]).data('name') : "None");
                mainHtml.find('[name="pool2"]').val(selected[1] ? $(selected[1]).data('value') : 0);
                mainHtml.find('#pool2-name').text(selected[1] ? $(selected[1]).data('name') : "None");
                mainHtml.find('[name="pool1"]').trigger('change');
            }}}
        }).render(true);
    }

    static async executeRoll(actor, config) {
        // ... (Keep the executeRoll logic from the previous successful version)
    }
}
