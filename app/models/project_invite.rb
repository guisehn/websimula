class ProjectInvite < ApplicationRecord
  default_scope { where(registered_user_id: nil) }

  validates :email, presence: true
  validates :role, presence: true

  before_create :set_code

  belongs_to :registered_user, class_name: 'User', required: false
  belongs_to :inviter, class_name: 'User'
  belongs_to :project

  enum role: [ :admin, :editor ]

  private
    def set_code
      self.code = SecureRandom.uuid unless self.code
    end
end
