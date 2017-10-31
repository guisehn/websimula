class RulesController < ApplicationController
  before_action :authenticate_user!, only: [:new, :create, :update, :destroy]
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update, :destroy]
  before_action :set_agent
  before_action :set_rule, only: [:edit, :update, :destroy]

  def new
    @rule = @agent.rules.new
  end

  def create
    @rule = @agent.rules.new(rule_params)

    if @rule.save
      redirect_to edit_project_agent_path(@project, @agent), notice: 'Regra criada.'
    else
      render :new
    end
  end

  def edit
  end

  def update
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

    def rule_params
      p = params.require(:rule).permit(:name, :priority, :condition, :action)
      param_to_json(p, :condition)
      param_to_json(p, :action)
      p
    end
end
