class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :set_raven_context

  protected
    def check_system_admin_access!
      head :unauthorized unless current_user.admin?
    end

    def set_project_and_check_access!
      id = params[:project_id] || params[:id]
      @project = Project.find(id)
      @project.edited_by = current_user
      head :unauthorized unless @project.can_be_viewed_by?(current_user)
    end

    def check_project_edit_permission!
      head :unauthorized unless @project.can_be_edited_by?(current_user)
    end

    def check_project_management_permission!
      head :unauthorized unless @project.can_be_managed_by?(current_user)
    end

    def param_to_json(params, name)
      params[name] = nil if params[name] == 'null'
      params[name] = JSON.parse(params[name]) unless params[name].nil?
    end

    def set_raven_context
      Raven.user_context(id: current_user ? current_user.id : nil)
      Raven.extra_context(params: params.to_unsafe_h, url: request.url)
    end
end
