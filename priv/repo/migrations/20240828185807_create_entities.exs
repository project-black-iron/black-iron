defmodule BlackIron.Repo.Migrations.CreateEntities do
  use Ecto.Migration

  def change do
    create table(:entities) do
      add :pid, :string
      add :data, :map
      add :rev, :string
      add :revisions, {:array, :string}
      add :deleted_at, :naive_datetime

      timestamps(type: :utc_datetime)
    end
  end
end
