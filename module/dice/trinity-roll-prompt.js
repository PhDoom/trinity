export class TrinityRollPrompt {
    
    /**
     * Opens a dialog to confirm the roll and add situational modifiers.
     */
    static async confirmRoll(actor, dataset) {
        return new Promise((resolve) => {
            const dialogContent = `
                <form class="trinity-app">
                    <div class="form-group">
                        <label>Dice Pool Modifier:</label>
                        <input type="number" name="modifier" value="0" autofocus />
                    </div>
                    <p class="notes" style="font-size: 0.8em; color: #666;">
                        Add bonus dice (e.g., +2) or penalties (e.g., -1).
                    </p>
                </form>
            `;

            new Dialog({
                title: `Rolling ${dataset.name.capitalize()}`,
                content: dialogContent,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: "Roll Dice",
                        callback: (html) => {
                            const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
                            resolve({ modifier: modifier, cancelled: false });
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve({ cancelled: true })
                    }
                },
                default: "roll",
                close: () => resolve({ cancelled: true })
            }).render(true);
        });
    }

    /**
     * Executes the actual roll and sends it to the chat window.
     */
    static async executeRoll(actor, baseValue, config) {
        if (config.cancelled) return;

        // Calculate the final dice pool (Base Attribute + Modifier)
        const pool = Math.max(1, baseValue + config.modifier); // Prevents rolling 0 dice

        // Trinity Continuum uses d10s.
        // Because we registered your custom TrinityRoll class in trinity.js, 
        // Foundry will automatically apply any custom success-counting logic you have!
        const formula = `${pool}d10`;

        const roll = new Roll(formula, actor.getRollData());
        
        // V13 requirement: Rolls must be evaluated asynchronously
        await roll.evaluate();

        // Send the result to the chat log
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: `<strong>${actor.name}</strong> rolls ${datasetName(config, baseValue)}!`
        });
    }
}

// Quick helper to format the chat flavor text
function datasetName(config, baseValue) {
    let text = `${baseValue} base dice`;
    if (config.modifier > 0) text += ` (+${config.modifier} mod)`;
    if (config.modifier < 0) text += ` (${config.modifier} mod)`;
    return text;
}
