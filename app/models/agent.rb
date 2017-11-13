class Agent < ApplicationRecord
  audited

  belongs_to :project, required: true
  has_many :rules

  validates :project_id, presence: true
  validates :name, presence: true, uniqueness: { scope: :project_id }
  validates :perception_area, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def remove_from_initial_positions!
    p = self.project

    if p.initial_positions.present?
      p.edited_by = edited_by
      p.initial_positions = p.initial_positions.dup

      fixed_positions = p.initial_positions['fixed_positions']
      fixed_positions.delete(id.to_s) if fixed_positions.present?

      random_positions = p.initial_positions['random_positions']
      random_positions.delete(id.to_s) if random_positions.present?

      puts p.initial_positions

      p.save!
    end
  end
end
