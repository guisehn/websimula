# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_01_05_060957) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "agents", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "perception_area", default: 10
    t.text "image"
    t.integer "project_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "audits", id: :serial, force: :cascade do |t|
    t.integer "auditable_id"
    t.string "auditable_type"
    t.integer "associated_id"
    t.string "associated_type"
    t.integer "user_id"
    t.string "user_type"
    t.string "username"
    t.string "action"
    t.jsonb "audited_changes"
    t.integer "version", default: 0
    t.string "comment"
    t.string "remote_address"
    t.string "request_uuid"
    t.datetime "created_at"
    t.index ["associated_id", "associated_type"], name: "associated_index"
    t.index ["auditable_id", "auditable_type"], name: "auditable_index"
    t.index ["created_at"], name: "index_audits_on_created_at"
    t.index ["request_uuid"], name: "index_audits_on_request_uuid"
    t.index ["user_id", "user_type"], name: "user_index"
  end

  create_table "project_invites", id: :serial, force: :cascade do |t|
    t.string "code"
    t.string "email"
    t.integer "project_id"
    t.integer "role"
    t.integer "inviter_id"
    t.integer "registered_user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "project_users", id: :serial, force: :cascade do |t|
    t.integer "project_id", null: false
    t.integer "user_id", null: false
    t.integer "role", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "first_access", default: true, null: false
  end

  create_table "projects", id: :serial, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "stop_condition"
    t.jsonb "initial_positions"
    t.integer "visibility", default: 0, null: false
    t.text "description"
    t.integer "parent_project_id"
    t.datetime "deleted_at"
    t.index ["deleted_at"], name: "index_projects_on_deleted_at"
  end

  create_table "rules", id: :serial, force: :cascade do |t|
    t.integer "agent_id"
    t.string "name"
    t.integer "priority"
    t.jsonb "condition"
    t.jsonb "action"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.integer "system_role", default: 0, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "variables", id: :serial, force: :cascade do |t|
    t.integer "project_id"
    t.integer "data_type"
    t.string "name"
    t.string "initial_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "agents", "projects"
  add_foreign_key "audits", "users"
  add_foreign_key "project_invites", "projects"
  add_foreign_key "project_invites", "users", column: "inviter_id"
  add_foreign_key "project_invites", "users", column: "registered_user_id"
  add_foreign_key "project_users", "projects"
  add_foreign_key "project_users", "users"
  add_foreign_key "projects", "projects", column: "parent_project_id"
  add_foreign_key "rules", "agents"
  add_foreign_key "variables", "projects"
end
