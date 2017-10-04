class ProjectMailer < ApplicationMailer
  def registration_invite(project_invite)
    @project_invite = project_invite
    @subject = "Simula - Convite para o projeto #{project_invite.project.name}"
    @url = new_user_registration_url(invite: @project_invite.code)

    mail(to: @project_invite.email, subject: @subject)
  end
end
