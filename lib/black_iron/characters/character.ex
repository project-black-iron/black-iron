defmodule BlackIron.Characters.Character do
  use Ecto.Schema
  import Ecto.Changeset

  schema "characters" do
    field :alias, :string
    field :name, :string
    field :pid, :string
    field :description, :string
    field :pronouns, :string
    field :initiative, :string
    field :portrait, :string
    field :xp_added, :integer
    field :xp_spent, :integer

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(character, attrs) do
    character
    |> cast(attrs, [:pid, :name, :description, :pronouns, :alias, :initiative, :portrait, :xp_added, :xp_spent])
    |> validate_required([:pid, :name, :description, :pronouns, :alias, :initiative, :portrait, :xp_added, :xp_spent])
  end
end
