class CreatePaperDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :paper_documents do |t|
      t.references :paper, null: false, foreign_key: true
      t.binary :pdf_data, null: false
      t.string :pdf_filename, null: false
      t.string :pdf_content_type, null: false
      t.integer :pdf_byte_size, null: false

      t.timestamps
    end

    add_check_constraint :paper_documents, 'pdf_byte_size <= 104857600', name: 'paper_documents_pdf_size_limit'
  end
end
