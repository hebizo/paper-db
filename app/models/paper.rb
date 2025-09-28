class Paper < ApplicationRecord
  has_many :paper_authors, dependent: :destroy
  has_many :paper_tags, dependent: :destroy

  has_one :paper_document, dependent: :destroy

  has_many :authors, through: :paper_authors
  has_many :tags, through: :paper_tags
end
