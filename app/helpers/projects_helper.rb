module ProjectsHelper
  def agent_image(agent)
    agent.image || ActionController::Base.helpers.image_path('/assets/default-agent.png')
  end

  def user_role_badge(project_user)
    label_type = project_user.role == 'admin' ? 'danger' : 'warning'

    content_tag(:span, class: "label label-#{label_type}") do
      project_user.role.capitalize
    end
  end

  def project_visibility(project)
    I18n.t("activerecord.attributes.project.visibilities.#{project.visibility}")
  end

  def project_user_role(project_user)
    I18n.t("activerecord.attributes.project_user.roles.#{project_user.role}")
  end
end
