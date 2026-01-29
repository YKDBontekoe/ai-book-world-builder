# Factory Tycoon User Guide

Factory Tycoon is a resource management simulation integrated into the AI Book World Builder. Your goal is to build an automated factory chain that converts raw resources into cash.

## How to Play

### The Goal
Build a profitable self-sustaining factory. You start with **$20** and a base storage capacity of **50 items**.

### Controls
- **Select Building**: Left-click on any building in the bottom palette.
- **Place Building**: Left-click on an empty grid tile to place the selected building.
- **Remove Building**: Right-click on an existing building to destroy it. **Warning: You do not get a refund.**
- **Pause/Resume**: Use the "Start/Pause" button in the HUD to control time.

### The Simulation Loop
The game runs in "Ticks" (time cycles). Every tick:
1.  **Mines** produce Ore.
2.  **Smelters** and **Factories** consume inputs and produce outputs.
3.  **Markets** sell finished goods for Cash.

If your storage is full, production will stop ("Blocked"). You must expand storage or sell items to continue.

## Building Guide

| Building | Cost | Description | Inputs | Outputs |
| :--- | :--- | :--- | :--- | :--- |
| **Mine** | $10 | Extracts raw ore from the ground. | None | 1 Ore |
| **Smelter** | $25 | Refines ore into metal ingots. | 2 Ore | 1 Ingot |
| **Factory** | $60 | Assembles ingots into complex gadgets. | 2 Ingot | 1 Gadget |
| **Market** | $80 | Sells gadgets to the public. | 1 Gadget | **$5 Cash** |
| **Warehouse** | $40 | Increases global storage capacity. | None | +50 Capacity |

## Strategy Guide

To create a perfectly balanced chain with no waste, you should aim for this ratio:

> **4 Mines** → **2 Smelters** → **1 Factory** → **1 Market**

### Why this works:
1.  **4 Mines** produce **4 Ore**.
2.  **2 Smelters** need 4 Ore (2 each) to produce **2 Ingots**.
3.  **1 Factory** needs 2 Ingots to produce **1 Gadget**.
4.  **1 Market** sells 1 Gadget.

**Total Cost:** $230
**Profit:** $5 per tick

### Tips
-   **Watch your Storage:** If your "Storage" bar fills up, your mines will stop working. Build a Warehouse or ensure your Market is selling fast enough.
-   **Don't Overbuild:** If you build a Factory before you have enough Smelters, it will sit idle ("Starved"), wasting your initial cash.
-   **Manual Sales:** You can manually sell excess resources using the "Sell 1" buttons in the Inventory panel to get quick cash, but automated Markets are more efficient in the long run.
