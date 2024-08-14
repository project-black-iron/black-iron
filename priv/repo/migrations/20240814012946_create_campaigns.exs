defmodule BlackIron.Repo.Migrations.CreateCampaigns do
  use Ecto.Migration

  def change do
    create table(:campaigns) do
      add :name, :string, null: false
      add :description, :text, null: false
      add :slug, :citext, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:campaigns, [:slug])
  end
end
