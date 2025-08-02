class PaperTag < ApplicationRecord
  belongs_to :paper
  belongs_to :tag
end
