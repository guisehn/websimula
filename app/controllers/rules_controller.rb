class RulesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update, :destroy]
  before_action :set_agent
  before_action :set_rule, only: [:edit, :update]

  def new
    @rule = @agent.rules.new
  end

  def create
    @rule = @agent.rules.new(rule_params)

    if @rule.save
      redirect_to edit_project_agent_path(@project, @agent), notice: 'Regra criada com sucesso.'
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @rule.update(rule_params)
      redirect_to edit_project_agent_path(@project, @agent), notice: 'Regra atualizada com sucesso.'
    else
      render :edit
    end
  end

  private
    def set_agent
      @agent = @project.agents.find(params[:agent_id])
    end

    def set_rule
      @rule = Rule.where(agent_id: @project.agents.map(&:id)).find(params[:id])
    end

    def rule_params
      p = params.require(:rule).permit(:name, :priority, :condition, :action)
      param_to_json(p, :condition)
      param_to_json(p, :action)
      p
    end
end
