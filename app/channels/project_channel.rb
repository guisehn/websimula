class ProjectChannel < ApplicationCable::Channel
  def subscribed
    project = Project.find_by_id(params[:project_id])

    if project && project.can_be_viewed_by?(current_user)
      stream_from "project_#{project.id}"
    else
      reject
    end
  end
end
