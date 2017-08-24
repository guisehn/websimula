class ProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!, only: [:show, :edit, :update, :destroy, :agents]
  before_action :check_management_permission!, only: [:edit, :update, :destroy]

  before_action :load_agents, only: [:show, :agents]

  def index
    @projects = Project.all
  end

  def agents
    render partial: 'projects/agents'
  end

  def show
  end

  def new
    @project = Project.new
  end

  def edit
  end

  def create
    @project = Project.new(project_params)

    ActiveRecord::Base.transaction do
      if @project.save
        @project.project_users.create!(user: current_user, role: :admin)
        redirect_to @project, notice: 'Project was successfully created.'
      else
        render :new
      end
    end
  end

  def update
    if @project.update(project_params)
      redirect_to @project, notice: 'Project was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @project.destroy
    redirect_to projects_url, notice: 'Project was successfully destroyed.'
  end

  private
    def set_project_and_check_access!
      @project = Project.find(params[:id])
      head :unauthorized unless @project.can_be_viewed_by?(current_user)
    end

    def project_params
      params.require(:project).permit(:name)
    end

    def check_management_permission!
      head :unauthorized unless @project.can_be_managed_by?(current_user)
    end

    def load_agents
      @agents = @project.agents.order(name: :asc)
    end
end
