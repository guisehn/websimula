class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  protected
    def set_project_and_check_access!
      id = params[:project_id] || params[:id]
      @project = Project.find(id)
      head :unauthorized unless @project.can_be_viewed_by?(current_user)
    end

    def check_project_edit_permission!
      head :unauthorized unless @project.can_be_edited_by?(current_user)
    end

    def check_project_management_permission!
      head :unauthorized unless @project.can_be_managed_by?(current_user)
    end
end
