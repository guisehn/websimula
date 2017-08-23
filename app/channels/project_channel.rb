class ProjectChannel < ApplicationCable::Channel
  # Called when the consumer has successfully
  # become a subscriber of this channel.
  def subscribed
    project = Project.find_by_id(params[:project_id])
    reject unless project && project.can_be_viewed_by?(current_user)
  end
end
