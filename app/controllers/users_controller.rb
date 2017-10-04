class UsersController < ApplicationController
  INVITE_ID_PREFIX = 'invite:'

  before_action :set_project_and_check_access!
  before_action :check_project_management_permission!

  def create
    user = User.find_by_email(user_params[:email])

    if user
      project_user = @project.users.find_by_id(user.id)

      if project_user
        render json: { error: 'Este usuário já faz parte do projeto.' }, status: 400
      else
        @project.project_users.create!(
          user: user,
          role: user_params[:role] || :editor
        )

        flash[:notice] = 'Membro adicionado com sucesso.' if params[:set_flash]
        render json: { result: 'added' }
      end
    else
      @project.project_invites.where(email: user_params[:email]).destroy_all

      invite = @project.project_invites.create!(
        email: user_params[:email],
        inviter: current_user,
        role: user_params[:role] || :editor
      )

      ProjectMailer.registration_invite(invite).deliver_now

      flash[:notice] = 'Convite enviado com sucesso.' if params[:set_flash]
      render json: { result: 'invited' }
    end
  end

  def destroy
    if params[:id].start_with?(INVITE_ID_PREFIX)
      instance = @project.project_invites.find_by!(id: params[:id].gsub(INVITE_ID_PREFIX, ''))
    else
      instance = @project.project_users.find_by!(user_id: params[:id])
    end

    instance.destroy!

    redirect_to edit_project_path(@project),
      notice: instance.is_a?(ProjectUser) ? 'Membro removido da equipe.' : 'Convite removido.'
  end

  private
    def user_params
      params.require(:user).permit(:id, :email, :role)
    end
end
