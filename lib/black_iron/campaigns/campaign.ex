defmodule BlackIron.Campaigns.Campaign do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  @derive {Jason.Encoder, only: [:id, :name, :description, :slug]}

  schema "campaigns" do
    field :name, :string
    field :description, :string
    field :slug, :string
    field :_rev, :string
    field :_revisions, {:array, :string}, default: []
    field :deleted_at, :naive_datetime

    many_to_many :users, BlackIron.Accounts.User, join_through: "campaign_memberships"
    has_many :memberships, BlackIron.Campaigns.Membership

    timestamps(type: :utc_datetime)
  end

  @doc false
  def deactivate_changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:deleted_at, :_rev, :_revisions])
    |> validate_required([:deleted_at, :_rev, :_revisions])
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:name, :description, :slug, :_rev, :_revisions])
    |> validate_required([:name, :description, :slug, :_rev, :_revisions])
  end
end
