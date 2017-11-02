class Project < ApplicationRecord
  self.per_page = 18

  has_many :agents
  has_many :variables
  has_many :project_invites

  has_many :project_users
  has_many :users, through: :project_users

  enum visibility: [ :secret, :open ]

  validates :name, presence: true
  validates :visibility, presence: true

  def can_be_viewed_by?(user)
    open? || (user && (user.admin? || project_users.find_by(user: user)))
  end

  def can_be_edited_by?(user)
    user && (user.admin? || project_users.find_by(user: user, role: [:admin, :editor]))
  end

  def can_be_managed_by?(user)
    user && (user.admin? || project_users.find_by(user: user, role: :admin))
  end
end
