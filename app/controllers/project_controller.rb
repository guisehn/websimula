class ProjectController < ApplicationController
  before_action :set_project_and_check_access!

  protected
    def set_project_and_check_access!
      @project = Project.find(params[:project_id])
      head :unauthorized unless @project.can_be_viewed_by?(current_user)
    end

    def check_management_permission!
      head :unauthorized unless @project.can_be_managed_by?(current_user)
    end
end
