defmodule BlackIron.Campaigns.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: [:id, :username, :campaign_id, :roles]}

  schema "campaign_memberships" do
    belongs_to :user, BlackIron.Accounts.User, references: :username, foreign_key: :username
    belongs_to :campaign, BlackIron.Campaigns.Campaign
    field :roles, {:array, Ecto.Enum}, values: [:owner, :guide, :player], default: [:player]

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:roles])
    |> validate_required([:roles])
    |> validate_length(:roles, min: 1, max: 3)
  end
end
