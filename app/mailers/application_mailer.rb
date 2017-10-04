class ApplicationMailer < ActionMailer::Base
  default from: ENV['EMAIL_FROM_ADDRESS']
  layout 'mailer'
end
