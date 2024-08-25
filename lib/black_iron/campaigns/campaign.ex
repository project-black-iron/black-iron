defmodule BlackIron.Campaigns.Campaign do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder,
           only: [:pid, :name, :description, :_rev, :_revisions, :deleted_at, :memberships]}

  schema "campaigns" do
    field :name, :string
    field :description, :string
    field :pid, :string, autogenerate: {BlackIron.Utils, :gen_pid, []}
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
    |> cast(attrs, [:pid, :name, :description, :_rev, :_revisions])
    |> unique_constraint(:pid)
    |> validate_required([:name, :description, :_rev, :_revisions])
    |> validate_revs()
  end

  def validate_revs(changeset) do
    changeset
    # TODO(@zkat): More thorough UUID validation.
    |> validate_format(:_rev, ~r/^[a-fA-F0-9-]+$/, message: "Must be a valid UUID")
    |> validate_change(:_revisions, fn _, data ->
      if Enum.at(data, 0) === fetch_change!(changeset, :_rev) do
        []
      else
        [{:_revisions, "The latest _rev must be the head of _revisions"}]
      end
    end)
  end
end
