class User < ApplicationRecord
  audited only: [:name, :email, :system_role]

  has_many :project_users
  has_many :projects, through: :project_users

  validates :name, presence: true

  enum system_role: [:user, :admin]

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  def can_delete_user_from_project?(user, project)
    project.can_be_managed_by?(self) && user.id != self.id
  end
end
