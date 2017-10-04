class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]
  before_action :configure_account_update_params, only: [:update]

  before_action :set_invite, only: [:new, :create]

  # GET /resource/sign_up
  def new
    build_resource({ email: @invite ? @invite.email : nil })
  end

  # POST /resource
  def create
    ActiveRecord::Base.transaction do
      super

      if resource.persisted? && @invite
        @invite.project.project_users.create!(user: resource, role: :editor)
        @invite.update!(registered_user: resource)
      end
    end
  end

  private
    def set_invite
      invite_code = params[:invite] || (params[:user] ? params[:user][:invite] : nil)
      @has_invite_parameter = invite_code != nil
      @invite = invite_code ? ProjectInvite.find_by_code(invite_code) : nil
    end

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  protected
    # If you have extra params to permit, append them to the sanitizer.
    def configure_sign_up_params
      devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    end

    # If you have extra params to permit, append them to the sanitizer.
    def configure_account_update_params
      devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
    end

    # The path used after sign up.
    # def after_sign_up_path_for(resource)
    #   super(resource)
    # end

    # The path used after sign up for inactive accounts.
    # def after_inactive_sign_up_path_for(resource)
    #   super(resource)
    # end
end
