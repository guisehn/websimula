class Project < ApplicationRecord
  has_many :agents
  has_many :variables
  has_many :project_invites

  has_many :project_users
  has_many :users, through: :project_users

  validates :name, presence: true

  def can_be_viewed_by?(user)
    project_users.find_by(user: user)
  end

  def can_be_edited_by?(user)
    project_users.find_by(user: user, role: [:admin, :editor])
  end

  def can_be_managed_by?(user)
    project_users.find_by(user: user, role: :admin)
  end
end
