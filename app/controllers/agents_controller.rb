class AgentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!
  before_action :check_project_edit_permission!, only: [:create, :update, :destroy]

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

  private
    def agent_params
      params.require(:agent).permit(:name, :perception_area, :image)
    end
end
