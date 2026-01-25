# Factory Tycoon

A deterministic factory building simulation.

## How to Play
1. **Goal:** Build a profitable factory chain by converting Ore -> Ingot -> Gadget -> Cash.
2. **Controls:**
   - **Left Click** on the palette to select a building.
   - **Left Click** on the grid to place it.
   - **Right Click** on a building to remove it (no refund).
3. **Buildings:**
   - **Mine:** Produces Ore.
   - **Smelter:** Converts Ore to Ingot.
   - **Factory:** Converts Ingot to Gadget.
   - **Market:** Sells Gadgets for Cash.
   - **Warehouse:** Increases storage capacity.
4. **Status:**
   - **Green (Running):** Working normally.
   - **Yellow (Starved):** Missing inputs.
   - **Red (Blocked):** Output full / No storage space.

## Architecture
- **Engine:** Deterministic simulation loop (`simulateTick`).
- **State:** React Context + useReducer.
- **Rendering:** SVG/Lucide Icons on a CSS Grid.
