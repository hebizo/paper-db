class Tag < ApplicationRecord
  has_many :paper_tags, dependent: :destroy
  has_many :papers, through: :paper_tags
end
