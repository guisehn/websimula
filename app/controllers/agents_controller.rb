class AgentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:new, :create, :update]
  before_action :set_agent, only: [:edit, :update, :destroy]

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
      if @agent.update(project_params)
        format.html { redirect_to @agent }
        format.json { render :show, status: :ok }
      else
        format.html { render :new }
        format.json { render json: @agent.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    def agent_params
      params.require(:agent).permit(:name, :perception_area, :image)
    end

    def set_agent
      @agent = @project.agents.find(params[:id])
    end
end
