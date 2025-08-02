class CreatePapers < ActiveRecord::Migration[7.1]
  def change
    create_table :papers do |t|
      t.string :title
      t.string :url
      t.text :memo

      t.timestamps
    end
  end
end
