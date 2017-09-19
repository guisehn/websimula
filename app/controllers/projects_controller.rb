class ProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!, only: [:show, :edit, :update, :destroy, :agents, :variables, :stop_condition, :edit_stop_condition, :initial_positions, :edit_initial_positions, :settings]
  before_action :check_project_management_permission!, only: [:edit, :update, :destroy, :edit_stop_condition, :edit_initial_positions]

  before_action :load_agents, only: [:show, :agents]
  before_action :load_variables, only: [:show, :variables]

  def index
    @projects = Project.all
  end

  def agents
    render partial: 'projects/agents'
  end

  def variables
    render partial: 'projects/variables'
  end

  def stop_condition
    render partial: 'projects/stop_condition'
  end

  def initial_positions
    render partial: 'projects/initial_positions'
  end

  def show
  end

  def new
    @project = Project.new
  end

  def edit
    @project_users = @project.project_users.includes(:user)
  end

  def edit_stop_condition
  end

  def edit_initial_positions
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
      redirect_to @project
    else
      render :edit
    end
  end

  def destroy
    @project.destroy
    redirect_to projects_url, notice: 'Projeto excluído.'
  end

  private
    def project_params
      p = params.require(:project).permit(:name, :initial_positions, :stop_condition)
      param_to_json(p, :initial_positions)
      param_to_json(p, :stop_condition)
      p
    end

    def load_agents
      @agents = @project.agents.order('LOWER(name) ASC')
    end

    def load_variables
      @variables = @project.variables.order('LOWER(name) ASC')
    end
end
