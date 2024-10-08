defmodule BlackIron.Campaigns.Campaign do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:name, :description, :memberships]}

  @entype :campaign

  @primary_key false

  embedded_schema do
    field :__type__, :string
    field :name, :string
    field :description, :string

    embeds_many :memberships, BlackIron.Campaigns.Membership
  end

  def entype, do: @entype

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:name, :description])
    |> cast_embed(:memberships, with: &BlackIron.Campaigns.Membership.changeset/2)
    |> validate_required([:name, :description])
    |> put_change(:__type__, to_string(@entype))
  end
end
