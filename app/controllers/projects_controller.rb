class ProjectsController < ApplicationController
  before_action :authenticate_user!, except: [:show, :open]
  before_action :check_system_admin_access!, only: [:all]
  before_action :set_project_and_check_access!, except: [:index, :open, :all, :tutorial, :new, :create]
  before_action :check_project_management_permission!, only: [:destroy]
  before_action :check_project_edit_permission!, only: [:edit, :edit_stop_condition, :edit_initial_positions, :update]

  before_action :load_agents, only: [:show, :agents]
  before_action :load_variables, only: [:show, :variables]

  helper_method :project_visibility_options
  helper_method :show_description

  def index
    @projects = current_user.projects.order('LOWER(name) asc')
  end

  def open
    @projects = Project.where(visibility: :open).order('LOWER(name) asc')
  end

  def all
    @projects = Project.order('id desc').includes(:users).paginate(:page => params[:page])
  end

  def tutorial
    render layout: nil
  end

  def agents
    if request.xhr?
      render partial: 'projects/agents'
    else
      redirect_to new_project_agent_path(@project)
    end
  end

  def variables
    if request.xhr?
      render partial: 'projects/variables'
    else
      redirect_to new_project_variable_path(@project)
    end
  end

  def stop_condition
    if request.xhr?
      render partial: 'projects/stop_condition'
    else
      redirect_to edit_stop_condition_project_path(@project)
    end
  end

  def initial_positions
    if request.xhr?
      render partial: 'projects/initial_positions'
    else
      redirect_to edit_initial_positions_project_path(@project)
    end
  end

  def show
  end

  def new
    @project = Project.new
  end

  def edit
    @project_users = @project.project_users.includes(:user)
    @project_invites = @project.project_invites
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
        redirect_to @project
      else
        render :new
      end
    end
  end

  def update
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to @project }
        format.json { render :show, status: :ok }
      else
        format.html { render :new }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @project.destroy
    redirect_to projects_url, notice: 'Projeto excluído.'
  end

  def fork
    copy = ProjectForkGenerator.new(@project, current_user).fork
    redirect_to copy
  end

  def first_access
    @project.project_users
      .find_by!(user_id: current_user.id)
      .update!(first_access: params[:first_access])

    head :no_content
  end

  private
    def project_params
      allowed_params = [:initial_positions, :stop_condition, :description]
      allowed_params << :name << :visibility if !@project || @project.can_be_managed_by?(current_user)

      p = params.require(:project).permit(allowed_params)
      param_to_json(p, :initial_positions)
      param_to_json(p, :stop_condition)
      p
    end

    def project_visibility_options
      Project.visibilities.keys.map do |visibility|
        {
          value: visibility,
          text: t("activerecord.attributes.project.visibilities.#{visibility}")
        }
      end
    end

    def load_agents
      @agents = @project.agents.order('LOWER(name) ASC')
    end

    def load_variables
      @variables = @project.variables.order('LOWER(name) ASC')
    end

    def show_description
      @agents.length > 0 && (@project.description? || @project.can_be_edited_by?(current_user))
    end
end
