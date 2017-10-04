class Variable < ApplicationRecord
  belongs_to :project

  enum data_type: [ :number, :string ]

  validates :project_id, presence: true
  validates :data_type, presence: true
  validates :name, presence: true, uniqueness: { scope: :project_id }
  validates :initial_value, presence: true, if: :number?
  validates :initial_value, numericality: true, if: :number?
end
