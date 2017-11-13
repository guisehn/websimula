class RulesController < ApplicationController
  before_action :authenticate_user!, only: [:new, :create, :update, :destroy]
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update, :destroy]
  before_action :set_agent
  before_action :set_rule, only: [:edit, :update, :destroy]
  before_action :find_rule_to_duplicate, only: [:new, :create]

  def index
    @rules = @agent.rules

    if request.xhr?
      render partial: 'agents/rules'
    else
      redirect_to new_project_agent_rule_path(@project, @agent)
    end
  end

  def new
    if @duplicate
      @rule = @duplicate.dup
      @rule.name = @rule.priority = nil
    else
      @rule = @agent.rules.new
    end
  end

  def create
    @rule = @duplicate ? Rule.new : @agent.rules.new
    @rule.assign_attributes(rule_params)

    validate_agent_used

    if @rule.save
      redirect_to edit_project_agent_path(@project, @rule.agent), notice: 'Regra criada.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    validate_agent_used

    if @rule.update(rule_params)
      redirect_to edit_project_agent_path(@project, @agent), notice: 'Regra atualizada.'
    else
      render :edit
    end
  end

  def destroy
    @rule.destroy!
    redirect_to edit_project_agent_path(@project, @agent), notice: 'Regra excluída.'
  end

  private
    def set_agent
      @agent = @project.agents.find(params[:agent_id])
    end

    def set_rule
      @rule = @agent.rules.find(params[:id])
      @rule.edited_by = current_user
    end

    def validate_agent_used
      if @rule.agent && !@rule.agent.project.can_be_edited_by?(current_user)
        @rule.agent_id = nil
      end
    end

    def rule_params
      p = params.require(:rule).permit(:name, :priority, :condition, :action, :agent_id)
      param_to_json(p, :condition)
      param_to_json(p, :action)
      p
    end

    def find_rule_to_duplicate
      @duplicate = params[:duplicate] ? Rule.for_project(@project).find(params[:duplicate]) : nil
    end
end
