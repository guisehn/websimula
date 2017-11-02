class VariablesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update, :destroy]
  before_action :set_variable, only: [:edit, :update, :destroy]

  helper_method :variable_data_type_options

  def new
    @variable = @project.variables.new
  end

  def create
    @variable = @project.variables.new(variable_params)

    if @variable.save
      redirect_to @project
    else
      render :new
    end
  end

  def edit
  end

  def update
    @variable.assign_attributes(variable_params)

    name_changed = @variable.name_changed?
    previous_name = @variable.name_was

    ActiveRecord::Base.transaction do
      if @variable.save
        if name_changed
          usage_updater = VariableUsageUpdater.new(@project, previous_name, @variable.name, current_user)
          usage_updater.update
        end

        redirect_to @project
      else
        render :edit
      end
    end
  end

  def destroy
    @usage = ResourceUsageFinder.new(@project, @variable).find

    unless @usage.found
      @variable.destroy!
      redirect_to @project
    end
  end

  private
    def variable_data_type_options
      Variable.data_types.keys.map { |type| [type, t("activerecord.attributes.variable.data_types.#{type}")] }
    end

    def variable_params
      params.require(:variable).permit(:name, :data_type, :initial_value)
    end

    def set_variable
      @variable = @project.variables.find(params[:id])
    end
end
