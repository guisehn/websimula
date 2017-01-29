class ProjectUser < ApplicationRecord
  belongs_to :project
  belongs_to :user

  enum role: [ :admin, :editor ]
end
