function parseLabels(param){
  const obj = {};
  if (typeof(param) !== "string"){
    throw "Bad Labels Type";
  }
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
  return obj;
}

module.exports = { 
  parseLabels 
};
