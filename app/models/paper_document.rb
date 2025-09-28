class PaperDocument < ApplicationRecord
  MAX_PDF_SIZE = 100.megabytes

  belongs_to :paper

  validates :pdf_filename, presence: true
  validates :pdf_content_type, presence: true, inclusion: { in: ['application/pdf'] }
  validates :pdf_byte_size,
            numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_PDF_SIZE }
end
