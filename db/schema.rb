# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171103010550) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "agents", force: :cascade do |t|
    t.string   "name"
    t.integer  "perception_area"
    t.text     "image"
    t.integer  "project_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "project_invites", force: :cascade do |t|
    t.string   "code"
    t.string   "email"
    t.integer  "project_id"
    t.integer  "role"
    t.integer  "inviter_id"
    t.integer  "registered_user_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
  end

  create_table "project_users", force: :cascade do |t|
    t.integer  "project_id", null: false
    t.integer  "user_id",    null: false
    t.integer  "role",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "projects", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.jsonb    "stop_condition"
    t.jsonb    "initial_positions"
    t.integer  "visibility",        default: 0, null: false
    t.text     "description"
    t.integer  "parent_project_id"
    t.datetime "deleted_at"
    t.index ["deleted_at"], name: "index_projects_on_deleted_at", using: :btree
  end

  create_table "rules", force: :cascade do |t|
    t.integer  "agent_id"
    t.string   "name"
    t.integer  "priority"
    t.jsonb    "condition"
    t.jsonb    "action"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "name"
    t.integer  "system_role",            default: 0,  null: false
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

  create_table "variables", force: :cascade do |t|
    t.integer  "project_id"
    t.integer  "data_type"
    t.string   "name"
    t.string   "initial_value"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

end
