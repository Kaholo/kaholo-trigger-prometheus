const { findTriggers, parseLabels } = require(`./helpers`);
const minimatch = require("minimatch");

async function alertWebhook(req, res) {
  const body = req.body;
  const groupKey = body.groupKey;
  if (!groupKey){
    res.send(`Bad prometheus webhook format`);
    console.error("Bad prometheus webhook format");
    return;
  }
  for (let i = 0; i < body.alerts.length; i++){
    const alert = body.alerts[i];
    const {status, labels} = alert;
    const alertName = labels.alertname || "";
    findTriggers(
      validateTrigger,
      [alertName, groupKey, status, labels],
      alert,
      req.io, res,
      "alertWebhook",
      `alert ${alertName}`
    );
  }
}

function validateTrigger(trigger, [alertName, groupKey, status, labels]) {
  const alertNamePat = (trigger.params.find((o) => o.name === `alertNamePat`).value || "").trim();
  const groupKeyPat = (trigger.params.find((o) => o.name === `groupKeyPat`).value || "").trim();
  const trigStatus = (trigger.params.find((o) => o.name === `status`).value || "Both");
  const trigLabels = parseLabels(trigger.params.find((o) => o.name === `labels`).value);

  // Check if the group key pattern was provided, and if so check it matches request
  if (groupKeyPat && !minimatch(groupKey, groupKeyPat)) {
    throw `Not matching group key`;
  }
  // Check if the alert name pattern was provided, and if so check it matches request
  if (alertNamePat && !minimatch(alertName, alertNamePat)) {
    throw `Not matching alert name`;
  }
  // Check if status was provided, and if so check it matches request
  if (trigStatus !== "Both" && trigStatus != status) {
    throw `Not matching status`;
  }
  // check if all trigger labels included in request params
  if (trigLabels && !Object.entries(trigLabels).every(([key, val]) => {
    return labels.hasOwnProperty(key) && labels[key] == val; 
  })) {
    throw `Not matching labels`;
  }
}

module.exports = { 
  alertWebhook
};