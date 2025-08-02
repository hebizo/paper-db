class CreatePaperTags < ActiveRecord::Migration[7.1]
  def change
    create_table :paper_tags do |t|
      t.integer :paper_id
      t.integer :tag_id

      t.timestamps
    end
  end
end
