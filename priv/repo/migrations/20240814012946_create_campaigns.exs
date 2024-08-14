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

    create table(:campaign_memberships) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :campaign_id, references(:campaigns, on_delete: :delete_all), null: false
      add :roles, {:array, :string}, default: ["player"], null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:campaign_memberships, [:user_id, :campaign_id])
  end
end
