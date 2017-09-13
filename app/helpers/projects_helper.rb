module ProjectsHelper
  def agent_image(agent)
    agent.image || ActionController::Base.helpers.image_path('/assets/default-agent.png')
  end
end
