class SimulationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project_and_check_access!

  def new
  end
end
