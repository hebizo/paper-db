class CreatePaperAuthors < ActiveRecord::Migration[7.1]
  def change
    create_table :paper_authors do |t|
      t.integer :paper_id
      t.integer :author_id

      t.timestamps
    end
  end
end
