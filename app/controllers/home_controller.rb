class HomeController < ApplicationController
  def index
    redirect_to projects_path
  end
end
