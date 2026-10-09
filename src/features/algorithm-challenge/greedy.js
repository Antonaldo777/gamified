export function allocateWater(plots, availableLiters) {
  if (!Number.isFinite(availableLiters) || availableLiters < 0) {
    throw new Error("Water available must be a non-negative number.");
  }
  const ranked = plots
    .filter((plot) => plot.selected && plot.liters > 0)
    .map((plot) => ({ ...plot, efficiency: plot.benefit / plot.liters }))
    .sort((first, second) => second.efficiency - first.efficiency);
  const chosen = [];
  let remaining = availableLiters;

  for (const plot of ranked) {
    if (plot.liters <= remaining) {
      chosen.push(plot);
      remaining -= plot.liters;
    }
  }

  return {
    chosen,
    remaining,
    used: availableLiters - remaining,
    totalBenefit: chosen.reduce((total, plot) => total + plot.benefit, 0),
    ranked: ranked.map((plot) => ({ name: plot.name, efficiency: plot.efficiency })),
  };
}
