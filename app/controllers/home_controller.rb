class HomeController < ApplicationController
  def index
    if current_user
      redirect_to projects_path
    else
      redirect_to new_user_session_path
    end
  end
end
