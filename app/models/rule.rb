class Rule < ApplicationRecord
  audited

  default_scope { order('priority ASC, LOWER(name) ASC') }
  scope :for_project, ->(project) { where(agent: project.agents.pluck(:id)) }

  belongs_to :agent, required: true

  validates :name, presence: true
  validates :priority, presence: true, numericality: { only_integer: true, greater_than: 0 }
end
