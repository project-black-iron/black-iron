defmodule BlackIron.Characters.Character do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false

  @derive {Jason.Encoder,
           only: [
             :__type__,
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
    field :alias, :string
    field :name, :string
    field :description, :string
    field :pronouns, :string
    field :initiative, :string
    field :portrait, :string
    field :xp_added, :integer
    field :xp_spent, :integer
  end

  @doc false
  def changeset(character, attrs) do
    character
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
  end
end
