class AgentsController < ApplicationController
  before_action :authenticate_user!, only: [:new, :create, :update]
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update]
  before_action :set_agent, only: [:show, :edit, :update, :destroy]

  def show
    respond_to do |format|
      format.html { redirect_to edit_project_agent_path(@project, @agent) }
      format.json { render :show, status: :ok }
    end
  end

  def new
    @agent = @project.agents.new
  end

  def create
    @agent = @project.agents.new(agent_params)

    if @agent.save
      redirect_to @project
    else
      render :new
    end
  end

  def edit
    @rules = @agent.rules.order('priority ASC, LOWER(name) ASC')
  end

  def update
    respond_to do |format|
      if @agent.update(agent_params)
        format.html { redirect_to edit_agent_path(@agent) }
        format.json { render :show, status: :ok }
      else
        format.html { render :new }
        format.json { render json: @agent.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @agent.destroy!
    redirect_to @project, notice: 'Agente excluído.'
  end

  private
    def agent_params
      params.require(:agent).permit(:name, :perception_area, :image)
    end

    def set_agent
      @agent = @project.agents.find(params[:id])
      @agent.edited_by = current_user
    end
end
