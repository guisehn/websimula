class Rule < ApplicationRecord
  belongs_to :agent

  validates :name, presence: true
  validates :priority, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :action, presence: true
end
