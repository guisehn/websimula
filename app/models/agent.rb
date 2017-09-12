class Agent < ApplicationRecord
  belongs_to :project
  has_many :rules

  validates :project_id, presence: true
  validates :name, presence: true
  validates :perception_area, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end