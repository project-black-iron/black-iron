defmodule BlackIron.PCs.PC do
  use Ecto.Schema
  import Ecto.Changeset

  @entype :pc

  @primary_key false

  @derive {Jason.Encoder,
           only: [
             :campaign_pid,
             :player_pid,
             :alias,
             :name,
             :description,
             :pronouns,
             :initiative,
             :portrait,
             :xp_added,
             :xp_spent
           ]}

  embedded_schema do
    field :__type__, :string
    field :campaign_pid, :string
    field :player_pid, :string
    field :alias, :string
    field :name, :string
    field :description, :string
    field :pronouns, :string
    field :initiative, Ecto.Enum, values: [:"out-of-combat", :"has-initiative", :"no-initiative"]
    field :portrait, :string
    field :xp_added, :integer
    field :xp_spent, :integer
  end

  def entype, do: @entype

  @doc false
  def changeset(pc, attrs \\ %{}) do
    pc
    |> cast(attrs, [
      :name,
      :description,
      :pronouns,
      :alias,
      :initiative,
      :portrait,
      :xp_added,
      :xp_spent
    ])
    |> validate_required([
      :name,
      :description,
      :pronouns,
      :alias,
      :initiative,
      :portrait,
      :xp_added,
      :xp_spent
    ])
    |> put_change(:__type__, to_string(@entype))
  end
end
