const { parseLabels } = require(`./helpers`);
const minimatch = require("minimatch");

async function alertWebhook(req, res, settings, triggerControllers) {
  const body = req.body;
  const groupKey = body.groupKey;
  if (!groupKey){
    return res.status(400).send(`Bad prometheus webhook format`);
  }
  try {
    // filter out controllers without matching group key
    triggerControllers = triggerControllers.filter(trigger => !trigger.params.groupKeyPat || 
                                                              minimatch(groupKey, trigger.params.groupKeyPat));
    for (let i = 0; i < body.alerts.length; i++){
      const alert = body.alerts[i];
      const alertStatus = alert.status, alertLabels = alert.labels;
      const alertName = alertLabels.alertname || "";
      triggerControllers.forEach((trigger) => {
        const {alertNamePat, status} = trigger.params;
        const labels = parseLabels(trigger.params.labels);
        if (status && alertStatus !== status) return;
        if (alertNamePat && !minimatch(alertName, alertNamePat)) return;
        if (labels && !Object.entries(labels).every(([key, val]) =>   alertLabels.hasOwnProperty(key) &&
                                                                      alertLabels[key] == val)) return;
        trigger.execute(alertName, alert);
      });
    }
    res.status(200).send("OK");
  }
  catch (err){
    res.status(422).send(err.message);
  }
}

module.exports = { 
  alertWebhook
};