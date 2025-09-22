class PaperDocument < ApplicationRecord
  belongs_to :paper

  validates :pdf_data, presence: true
  validates :pdf_content_type, presence: true, inclusion: { in: ['application/pdf'] }
  validates :pdf_byte_size,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100.megabytes }
end
