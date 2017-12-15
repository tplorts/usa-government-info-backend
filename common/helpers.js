
const TrueExp = /^true$/i
function envBoolean (varName) {
  const varValue = process.env[varName]
  return varValue && TrueExp.test(varValue)
}


module.exports = {
  envBoolean,
}
