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

    create unique_index(:entities, [:pid])

    execute(
      # Up
      """
      CREATE INDEX campaign_memberships_gin_idx ON entities
      USING gin ((data->'memberships') jsonb_path_ops);
      """,
      # Down
      """
      DROP INDEX campaign_memberships_gin_idx;
      """
    )

    execute(
      # Up
      """
      CREATE INDEX campaign_pid_fkey_idx ON entities
      USING gin ((data->'campaign_pid') jsonb_path_ops);
      """,
      # Down
      """
      DROP INDEX campaign_pid_fkey_idx;
      """
    )
  end
end
