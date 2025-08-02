class Author < ApplicationRecord
  has_many :paper_authors, dependent: :destroy
  has_many :papers, through: :paper_authors
end
