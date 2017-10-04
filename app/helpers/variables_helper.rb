module VariablesHelper
  def variable_data_type(variable)
    I18n.t("activerecord.attributes.variable.data_types.#{variable.data_type}")
  end
end
