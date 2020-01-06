class HomeController < ApplicationController
  def index
    if current_user
      redirect_to projects_path
    else
      redirect_to new_user_session_path
    end
  end

  def robots_txt
    text = "User-Agent: *\nDisallow: *" if ENV['ROBOTS_NOINDEX'].present?
    text ||= ''
    render plain: text, content_type: 'text/plain'
  end
end
