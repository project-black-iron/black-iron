defmodule BlackIron.Campaigns.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  schema "campaign_memberships" do
    belongs_to :user, BlackIron.Accounts.User
    belongs_to :campaign, BlackIron.Campaigns.Campaign
    field :roles, {:array, Ecto.Enum}, values: [:owner, :guide, :player], default: [:player]

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:roles])
    |> validate_required([:roles])
  end
end
