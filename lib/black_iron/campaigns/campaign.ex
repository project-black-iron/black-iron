defmodule BlackIron.Campaigns.Campaign do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:__type__, :name, :description, :memberships]}

  embedded_schema do
    field :__type__, :string
    field :name, :string
    field :description, :string

    embeds_many :memberships, BlackIron.Campaigns.Membership
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:name, :description])
    |> cast_embed(:memberships,
      with: &BlackIron.Campaigns.Membership.changeset/2,
      required: true
    )
    |> validate_required([:name, :description])
  end
end
