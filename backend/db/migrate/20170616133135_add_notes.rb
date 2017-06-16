class AddNotes < ActiveRecord::Migration[5.1]
  def change
    create_table(:notes) do |t|
      t.column :body, :text
    end
  end
end
