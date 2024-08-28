defmodule BlackIron.Repo.Migrations.CreateCharacters do
  use Ecto.Migration

  def change do
    create table(:characters) do
      add :pid, :string
      add :name, :string
      add :description, :text
      add :pronouns, :string
      add :alias, :string
      add :initiative, :string
      add :portrait, :text
      add :xp_added, :integer
      add :xp_spent, :integer

      timestamps(type: :utc_datetime)
    end
  end
end
