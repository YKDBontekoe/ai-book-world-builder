# Balancing

## Economy

- Starting Cash: $20
- Base Capacity: 50

## Buildings

| Type      | Cost | Inputs      | Outputs     | Rate (/tick) | Notes |
|-----------|------|-------------|-------------|--------------|-------|
| Mine      | $10  | -           | 1 Ore       | 1            | Basic producer |
| Smelter   | $25  | 2 Ore       | 1 Ingot     | 1            | 2:1 ratio |
| Factory   | $60  | 2 Ingot     | 1 Gadget    | 1            | 2:1 ratio |
| Market    | $80  | 1 Gadget    | $5 Cash     | 1            | Sink |
| Warehouse | $40  | -           | -           | -            | +50 Capacity |

## Strategy

A perfect ratio chain requires:
- 4 Mines (produce 4 Ore)
- 2 Smelters (consume 4 Ore, produce 2 Ingots)
- 1 Factory (consumes 2 Ingots, produce 1 Gadget)
- 1 Market (consumes 1 Gadget)

Cost to build full chain:
40 (M) + 50 (S) + 60 (F) + 80 (Mk) = $230.
