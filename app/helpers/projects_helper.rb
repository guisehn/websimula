module ProjectsHelper
  def agent_image(agent)
    agent.image || '/assets/default-agent.png'
  end
end
