const config = require("./config");
const mapExecutionService = require("../../../api/services/map-execution.service");
const Trigger = require("../../../api/models/map-trigger.model");

async function findTriggers(validatationFn, arg, body, io, res, method, description) {
  try {
    const triggers = await Trigger.find({ plugin: config.name, method: method});
    console.log(`Found ${triggers.length} triggers`);
    triggers.forEach((trigger) => {
      try {
        validatationFn(trigger, arg);
        exec(trigger, body, io, description)
      }
      catch(err){
        console.error(err);
      }
    });
    res.send("OK");
  }
  catch(error){
    res.send(`ERROR: ${error.toString()}`);
  }
}

function exec(trigger, body, io, description) {
  console.log(trigger.map);
  const message = `${trigger.name} - ${description}`
  console.log(`******** Prometheus Trigger: executing map ${trigger.map} ********`);
  mapExecutionService.execute(
    trigger.map,
    null,
    io,
    { config: trigger.configuration },
    message,
    body
  );
}

function parseLabels(param){
  if (typeof(param) === "string"){
    const obj = {};
    param.split("\n").forEach(label => {
      let [key, ...value] = label.trim().split("=");
      if (!key || !value) {
        throw "Bad Labels Format";
      }
      if (Array.isArray(value)){
        value = value.join("=");
      }
      obj[key] = value;
    });
  }
  return {};
}

module.exports = { 
  findTriggers, 
  parseLabels 
};
