# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_08_02_080000) do
  create_table "authors", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "paper_authors", force: :cascade do |t|
    t.integer "paper_id"
    t.integer "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "paper_documents", force: :cascade do |t|
    t.integer "paper_id", null: false
    t.binary "pdf_data", null: false
    t.string "pdf_filename", null: false
    t.string "pdf_content_type", null: false
    t.integer "pdf_byte_size", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["paper_id"], name: "index_paper_documents_on_paper_id"
    t.check_constraint "pdf_byte_size <= 104857600", name: "paper_documents_pdf_size_limit"
  end

  create_table "paper_tags", force: :cascade do |t|
    t.integer "paper_id"
    t.integer "tag_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "papers", force: :cascade do |t|
    t.string "title"
    t.string "url"
    t.text "memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tags", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "paper_documents", "papers"
end
