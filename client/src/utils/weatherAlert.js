export const generateAlerts = (days) => {
  const alerts = [];

  if (!Array.isArray(days)) return alerts;

  days.forEach((d) => {
    if (d.main.humidity > 80) {
      alerts.push({
        title: "High humidity",
        detail: "Risk of fungal diseases.",
      });
    }
  });

  return alerts;
};
