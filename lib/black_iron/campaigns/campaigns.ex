defmodule BlackIron.Campaigns do
  @moduledoc """
  The Campaigns context.
  """

  import Ecto.Query, warn: false
  alias BlackIron.Repo

  alias BlackIron.Accounts.User
  alias BlackIron.Campaigns.{Campaign, Membership}
  require BlackIron.Entities
  alias BlackIron.Entities
  alias BlackIron.Entities.Entity

  def list_campaigns_for_user(%User{} = user) do
    from(e in Entity, as: :campaign)
    |> Entities.is_entype(:campaign, Campaign.entype())
    |> where_campaign_role(user)
    |> Repo.all()
  end

  # TODO(@zkat): authorization (don't really want others to be able to add
  # campaigns into someone else's account without going through the
  # invitaion process)
  @doc """
  Creates a campaign.

  ## Examples

      iex> create_campaign(%{field: value})
      {:ok, %Campaign{}}

      iex> create_campaign(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_campaign(%User{} = actor, attrs \\ %{}) do
    {:ok, res} =
      Repo.transaction(fn ->
        %Entity{}
        |> Entities.change_entity(Campaign, attrs)
        |> Repo.insert()
        |> case do
          {:ok, entity} ->
            {1, [entity]} =
              from(e in Entity,
                where: e.id == ^entity.id,
                update: [
                  set: [
                    data:
                      fragment(
                        "jsonb_set(?, '{memberships}', ?)",
                        e.data,
                        ^[%Membership{user_pid: actor.pid, roles: ["owner"]}]
                      )
                  ]
                ],
                select: e
              )
              |> Repo.update_all([])

            {:ok, entity}

          other ->
            other
        end
      end)

    res
  end

  def get_campaign(user, campaign_pid, role \\ nil)
  def get_campaign(nil, _campaign_pid, _role), do: nil
  def get_campaign(_, "__campaign_pid", _role), do: nil

  def get_campaign(%User{} = user, campaign_pid, role) do
    from(e in Entity,
      as: :campaign,
      where: e.pid == ^campaign_pid,
      select: e
    )
    |> Entities.is_entype(:campaign, Campaign.entype())
    |> where_campaign_role(user, role)
    |> Repo.one()
  end

  def where_campaign_role(q, %User{pid: user_pid}, role \\ :owner) do
    json = [
      %{
        user_pid: user_pid,
        roles: if(role, do: [to_string(role)], else: [])
      }
    ]

    q
    |> where(
      [campaign: c],
      fragment(
        "? @> ?::jsonb",
        c.data["memberships"],
        ^json
      )
    )
  end

  # TODO(@zkat): authorization
  @doc """
  Updates a campaign.

  ## Examples

      iex> update_campaign(campaign, %{field: new_value})
      {:ok, %Campaign{}}

      iex> update_campaign(campaign, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_campaign(%Entity{} = campaign, attrs) do
    # {:ok, res} =
    #   Repo.transaction(fn ->
    #     current_rev =
    #       from(c in Campaign, select: c.rev, where: c.id == ^campaign.id) |> Repo.one!()

    #     if current_rev != campaign.rev do
    #       {:error, %{conflict: current_rev}}
    #     else
    #       campaign
    #       |> Campaign.changeset(attrs |> put_rev(campaign))
    #       |> Repo.update()
    #     end
    #   end)

    # res
  end

  # TODO(@zkat): authorization
  @doc """
  Deletes a campaign.

  ## Examples

      iex> delete_campaign(campaign)
      {:ok, %Campaign{}}

      iex> delete_campaign(campaign)
      {:error, %Ecto.Changeset{}}

  """
  def delete_campaign(%Campaign{} = campaign) do
    # {:ok, res} =
    #   Repo.transaction(fn ->
    #     current_rev =
    #       from(c in Campaign, select: c.rev, where: c.id == ^campaign.id) |> Repo.one!()

    #     if current_rev != campaign.rev do
    #       {:error, %{conflict: current_rev}}
    #     else
    #       now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    #       campaign
    #       |> Campaign.deactivate_changeset(
    #         %{
    #           deleted_at: now
    #         }
    #         |> put_rev(campaign)
    #       )
    #       |> Repo.update()
    #     end
    #   end)

    # res
  end

  def check_membership(%User{} = user, campaign_pid, role \\ :owner) do
    case get_campaign(user, campaign_pid, role) do
      %Entity{} = campaign ->
        {:ok, campaign}

      nil ->
        {:error, :unauthorized}
    end
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking campaign changes.

  ## Examples

      iex> change_campaign(campaign)
      %Ecto.Changeset{data: %Entity{}}

  """
  def change_campaign(%Entity{} = campaign, attrs \\ %{}) do
    Entities.change_entity(campaign, Campaign, attrs)
  end
end
