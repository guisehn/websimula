class UsersController < ApplicationController
  before_action :check_management_permission!

  def index
    @project_users = @project.project_users.includes(:user)
  end
end
