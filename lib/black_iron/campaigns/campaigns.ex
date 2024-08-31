defmodule BlackIron.Campaigns do
  @moduledoc """
  The Campaigns context.
  """

  import Ecto.Query, warn: false
  alias BlackIron.Repo

  alias BlackIron.Accounts.User
  alias BlackIron.Campaigns.Campaign
  alias BlackIron.Entities.Entity

  @entype "campaign"
  
  def list_campaigns_for_user(%User{pid: pid}) do
    from(e in Entity,
      where: fragment("? ->> '__type__'", e.data) == ^@entype,
      where: fragment(
        "exists(select 1 from jsonb_array_elements(?) m(obj) where m.obj ->> 'user_id' = ?)",
        e.data["memberships"], ^pid
      )
    )
    |> Repo.all()
  end

  # TODO(@zkat): authorization
  @doc """
  Gets a single campaign.

  Raises `Ecto.NoResultsError` if the Campaign does not exist.

  ## Examples

      iex> get_campaign!(123)
      %Campaign{}

      iex> get_campaign!(456)
      ** (Ecto.NoResultsError)

  """
  def get_campaign!(id) do
    Repo.get!(Entity, id)
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
  def create_campaign(%User{}, attrs \\ %{}) do
    %Entity{}
    |> Entity.changeset(attrs |> put_rev(%Campaign{}))
    |> Repo.insert()
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
  def update_campaign(%Campaign{} = campaign, attrs) do
    {:ok, res} =
      Repo.transaction(fn ->
        current_rev =
          from(c in Campaign, select: c.rev, where: c.id == ^campaign.id) |> Repo.one!()

        if current_rev != campaign.rev do
          {:error, %{conflict: current_rev}}
        else
          campaign
          |> Campaign.changeset(attrs |> put_rev(campaign))
          |> Repo.update()
        end
      end)

    res
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
    {:ok, res} =
      Repo.transaction(fn ->
        current_rev =
          from(c in Campaign, select: c.rev, where: c.id == ^campaign.id) |> Repo.one!()

        if current_rev != campaign.rev do
          {:error, %{conflict: current_rev}}
        else
          now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

          campaign
          |> Campaign.deactivate_changeset(
            %{
              deleted_at: now
            }
            |> put_rev(campaign)
          )
          |> Repo.update()
        end
      end)

    res
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking campaign changes.

  ## Examples

      iex> change_campaign(campaign)
      %Ecto.Changeset{data: %Campaign{}}

  """
  def change_campaign(%Campaign{} = campaign, attrs \\ %{}) do
    Campaign.changeset(campaign, attrs)
  end

  defp put_rev(attrs, obj) do
    if !attrs["rev"] || !attrs["revisions"] do
      rev = Ecto.UUID.generate()
      revs = [rev | obj._revisions]
      attrs |> Map.put("rev", rev) |> Map.put("revisions", revs)
    else
      attrs
    end
  end
end
