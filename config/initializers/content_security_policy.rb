# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy
# For further information see the following documentation
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

# Rails.application.config.content_security_policy do |policy|
#   policy.default_src :self, :https
#   policy.font_src    :self, :https, :data
#   policy.img_src     :self, :https, :data
#   policy.object_src  :none
#   policy.script_src  :self, :https
#   policy.style_src   :self, :https

#   # Specify URI for violation reports
#   # policy.report_uri "/csp-violation-report-endpoint"
# end

# If you are using UJS then enable automatic nonce generation
#Rails.application.config.content_security_policy_nonce_generator = -> request { SecureRandom.base64(16) }

# Set the nonce only to specific directives
#Rails.application.config.content_security_policy_nonce_directives = %w(script-src)

# Report CSP violations to a specified URI
# For further information see the following documentation:
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
# Rails.application.config.content_security_policy_report_only = true

Rails.application.config.content_security_policy do |policy|
  # We need to allow unsafe_eval and unsafe_inline for vue.js and our
  # <script> tags inside views to work.
  #
  # TODO: Ideally, the code should be refactored so that:
  # - unsafe_eval and unsafe_inline are no longer allowed in production
  # - vue tags are not used directly into views:
  #   https://stackoverflow.com/a/48651338/1443358
  # - remove <script> tags inside views; instead, move all code to /app/javascripts/
  #   and use something like Stimulus.js
  policy.script_src :self, :https, :unsafe_eval, :unsafe_inline
end