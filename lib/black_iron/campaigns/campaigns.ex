defmodule BlackIron.Campaigns do
  @moduledoc """
  The Campaigns context.
  """

  import Ecto.Query, warn: false
  alias BlackIron.Repo

  alias BlackIron.Accounts.User
  alias BlackIron.Campaigns.{Campaign, Membership}

  def list_campaigns_for_user(%User{id: user_id}) do
    from(c in Campaign,
      join: m in assoc(c, :memberships),
      where: m.user_id == ^user_id,
      preload: [:memberships]
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
  def get_campaign!(id), do: Repo.get!(Campaign, id)

  @doc """
  Creates a campaign.

  ## Examples

      iex> create_campaign(%{field: value})
      {:ok, %Campaign{}}

      iex> create_campaign(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_campaign(%User{} = user, attrs \\ %{}) do
    %Campaign{}
    |> Campaign.changeset(attrs |> put_rev(%Campaign{}))
    |> Ecto.Changeset.put_assoc(:memberships, [
      %Membership{user_id: user.id, roles: [:owner]}
    ])
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
          from(c in Campaign, select: c._rev, where: c.id == ^campaign.id) |> Repo.one!()

        if current_rev != campaign._rev do
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
          from(c in Campaign, select: c._rev, where: c.id == ^campaign.id) |> Repo.one!()

        if current_rev != campaign._rev do
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
    if !attrs["_rev"] || !attrs["_revisions"] do
      rev = Ecto.UUID.generate()
      revs = [rev | obj._revisions]
      attrs |> Map.put("_rev", rev) |> Map.put("_revisions", revs)
    else
      attrs
    end
  end
end
