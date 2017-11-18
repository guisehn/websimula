export default class InputValidator {
  static getInvalidInputs (inputValues, functionDefinition) {
    let functionInputs = functionDefinition.input || []

    return functionInputs
      .filter(input => !this.isInputValid(inputValues[input.name], input))
      .map(input => input.name)
  }

  static isInputValid(value, inputDefinition) {
    return !(inputDefinition.required &&
      (value === null || (inputDefinition.type === 'number' && value === '')))
  }
}
