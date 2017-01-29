class Project < ApplicationRecord
  has_many :project_users
  has_many :users, through: :project_users

  validates :name, presence: true

  def can_be_managed_by?(user)
    project_users.where(user: user, role: :admin)
  end
end
