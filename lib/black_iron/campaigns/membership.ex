defmodule BlackIron.Campaigns.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:user_id, :roles]}

  schema "campaign_memberships" do
    belongs_to :user, BlackIron.Accounts.User, type: :string, references: :pid
    belongs_to :campaign, BlackIron.Campaigns.Campaign
    field :roles, {:array, Ecto.Enum}, values: [:owner, :guide, :player], default: [:player]

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:user_id, :roles])
    |> validate_required([:user_id, :roles])
    |> validate_length(:roles, min: 1, max: 3)
  end
end
