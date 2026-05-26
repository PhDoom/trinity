export class TrinityRollPrompt {
    
    /**
     * Spawns the dialog box for the player to confirm their pool and add Enhancements.
     */
    static async confirmRoll(actor, options = {}) {
        // Pulls custom thresholds from the Settings tab, defaulting to standard rules
        const targetNumber = actor.system.rollSettings?.targetNumber?.value || 8;
        const doubleSuccess = actor.system.rollSettings?.doubleSuccess?.value || 10;

        const template = `
        <form>
            <div class="form-group">
                <label>Dice Pool</label>
                <input type="number" id="dice-pool" value="${options.defaultPool || 1}" min="1" autofocus/>
            </div>
            <div class="form-group">
                <label>Enhancement</label>
                <input type="number" id="enhancement" value="0" min="0"/>
            </div>
            <hr>
            <p style="text-align: center; color: #666; font-size: 0.9em; margin: 0;">
                Target Number: <strong>${targetNumber}</strong> | Double Success: <strong>${doubleSuccess}</strong>
            </p>
        </form>
        `;

        return new Promise((resolve) => {
            new Dialog({
                title: `Rolling ${options.name || "Dice"}`,
                content: template,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-dice-d20"></i>',
                        label: "Roll",
                        callback: (html) => {
                            const pool = parseInt(html.find('#dice-pool').val()) || 1;
                            const enh = parseInt(html.find('#enhancement').val()) || 0;
                            resolve({ pool, enhancement: enh, targetNumber, doubleSuccess, name: options.name });
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
        if (!config) return; // User cancelled the dialog

        // Standard Foundry V13 async roll evaluation
        const roll = new Roll(`${config.pool}d10`);
        await roll.evaluate();

        const diceResults = roll.terms[0].results.map(r => r.result);
        let naturalSuccesses = 0;
        let ones = 0;

        let diceHTML = `<div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 10px;">`;

        // Process each die according to Storypath rules
        diceResults.forEach(d => {
            let bgColor = "#eee";
            let borderColor = "#999";
            let color = "#333";

            // Double Success Rule [cite: 8, 9, 10]
            if (d >= config.doubleSuccess) {
                naturalSuccesses += 2;
                bgColor = "#d4edda";
                borderColor = "#28a745";
                color = "#155724";
            } 
            // Standard Target Number Success [cite: 3, 4, 6]
            else if (d >= config.targetNumber) {
                naturalSuccesses += 1;
                bgColor = "#cce5ff";
                borderColor = "#007bff";
                color = "#004085";
            } 
            // Botch component tracking [cite: 39, 40]
            else if (d === 1) {
                ones += 1;
                bgColor = "#f8d7da";
                borderColor = "#dc3545";
                color = "#721c24";
            }

            diceHTML += `<div style="padding: 5px 10px; border: 1px solid ${borderColor}; border-radius: 3px; background: ${bgColor}; color: ${color}; font-weight: bold; font-size: 1.2em;">${d}</div>`;
        });

        diceHTML += `</div>`;

        // A Botch requires zero natural successes AND at least one 1 [cite: 38]
        let isBotch = (naturalSuccesses === 0 && ones > 0);
        
        // Enhancements Golden Rule: Only added if at least 1 natural success is rolled [cite: 26, 29, 30]
        let totalSuccesses = naturalSuccesses > 0 ? naturalSuccesses + config.enhancement : 0;

        let resultText = "";
        let headerColor = "#333";

        // Format the final output message
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
