defmodule BlackIron.Campaigns.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:user_pid, :roles]}

  @primary_key false

  embedded_schema do
    belongs_to :user, BlackIron.Accounts.User,
      type: :string,
      references: :pid,
      foreign_key: :user_pid

    field :roles, {:array, Ecto.Enum}, values: [:owner, :guide, :player], default: [:player]
  end

  @doc false
  def changeset(campaign, attrs) do
    campaign
    |> cast(attrs, [:user_pid, :roles])
    |> validate_required([:user_pid, :roles])
    |> validate_length(:roles, min: 1, max: 3)
  end
end
