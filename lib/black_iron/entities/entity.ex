defmodule BlackIron.Entities.Entity do
  use Ecto.Schema
  import Ecto.Changeset
  import PolymorphicEmbed

  @derive {Jason.Encoder, only: [:pid, :data, :rev, :revisions, :deleted_at]}

  schema "entities" do
    field :pid, :string, autogenerate: {BlackIron.Utils, :gen_pid, []}
    field :rev, :string
    field :revisions, {:array, :string}
    field :deleted_at, :naive_datetime

    polymorphic_embeds_one(:data,
      types: [
        character: BlackIron.Characters.Character,
        campaign: BlackIron.Campaigns.Campaign
      ],
      on_type_not_found: :raise,
      on_replace: :update
    )

    timestamps(type: :utc_datetime)
  end

  @doc false
  def deactivate_changeset(entity, attrs) do
    entity
    |> cast(attrs, [:deleted_at, :rev, :revisions])
    |> validate_required([:deleted_at, :rev, :revisions])
  end

  @doc false
  def changeset(entity, attrs) do
    entity
    |> cast(attrs, [:pid, :rev, :revisions, :deleted_at])
    |> cast_polymorphic_embed(:data, required: true, with: [
      character: &BlackIron.Characters.Character.changeset/2,
      campaign: &BlackIron.Campaigns.Campaign.changeset/2
    ])
    |> validate_required([:rev, :revisions])
    |> validate_revs()
  end

  def validate_revs(changeset) do
    changeset
    # TODO(@zkat): More thorough UUID validation.
    |> validate_format(:rev, ~r/^[a-fA-F0-9-]+$/, message: "Must be a valid UUID")
    |> validate_change(:revisions, fn _, data ->
      if Enum.at(data, 0) === fetch_change!(changeset, :rev) do
        []
      else
        [{:revisions, "The latest rev must be the head of revisions"}]
      end
    end)
  end
end
