defmodule BlackIron.PCs do
  @moduledoc """
  The PCs context.
  """

  import Ecto.Query, warn: false
  alias BlackIron.Repo

  require BlackIron.Entities

  alias BlackIron.Accounts.User
  alias BlackIron.Campaigns
  alias BlackIron.PCs.PC
  alias BlackIron.Entities
  alias BlackIron.Entities.Entity

  @doc """
  Returns a list of pcs for a given campaign.

  ## Examples

      iex> list_pcs_for_campaign(user, campaign)
      [%Entity{}, ...]

  """
  def list_pcs_for_campaign(user, campaign)
  def list_pcs_for_campaign(nil, _), do: []
  def list_pcs_for_campaign(_, nil), do: []

  def list_pcs_for_campaign(%User{} = actor, %Entity{pid: campaign_pid}) do
    from(pc in Entity,
      as: :pc,
      join: camp in Entity,
      as: :campaign,
      on: camp.pid == fragment("?->>'campaign_pid'", pc.data),
      where: camp.pid == ^campaign_pid
    )
    # |> Entities.is_entype(:pc, PC.entype())
    # |> Entities.is_entype(:campaign, Campaign.entype())
    # |> Campaigns.where_campaign_role(actor)
    |> Repo.all()
  end

  @doc """
  Gets a single pc.

  ## Examples

      iex> get_pc(user, campaign, "dEdfjae3")
      %Entity{}

      iex> get_pc(user, campaign, "blahbla")
      nil

  """
  def get_pc(user, campaign, pc_pid, role \\ nil)
  def get_pc(nil, _, _, _), do: nil
  def get_pc(_, nil, _, _), do: nil
  def get_pc(_, _, nil, _), do: nil

  def get_pc(%User{} = user, %Entity{pid: campaign_pid}, pc_pid, role) do
    from(pc in Entity,
      as: :pc,
      where: pc.pid == ^pc_pid,
      join: camp in Entity,
      as: :campaign,
      on: camp.pid == type(pc.data["campaign_pid"], :string),
      where: camp.pid == ^campaign_pid,
      select: pc
    )
    |> Campaigns.where_campaign_role(user, role)
    |> Repo.one()
  end

  @doc """
  Creates a pc.

  ## Examples

      iex> create_pc(%{field: value})
      {:ok, %Entity{}}

      iex> create_pc(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_pc(%User{} = actor, %Entity{pid: campaign_pid}, attrs \\ %{}) do
    {:ok, res} =
      Repo.transaction(fn ->
        case Campaigns.get_campaign(actor, campaign_pid) do
          nil ->
            {:error, :unauthorized}

          %Entity{} ->
            changeset =
              %Entity{}
              |> Entities.change_entity(PC, attrs)

            changeset
            |> Ecto.Changeset.put_change(
              :data,
              %{Ecto.Changeset.get_field(changeset, :data) | campaign_pid: campaign_pid}
            )
            |> Repo.insert()
        end
      end)

    res
  end

  @doc """
  Updates a pc.

  ## Examples

      iex> update_pc(pc, %{field: new_value})
      {:ok, %PC{}}

      iex> update_pc(pc, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_pc(%PC{} = pc, attrs) do
    pc
    |> PC.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a pc.

  ## Examples

      iex> delete_pc(pc)
      {:ok, %PC{}}

      iex> delete_pc(pc)
      {:error, %Ecto.Changeset{}}

  """
  def delete_pc(%PC{} = pc) do
    Repo.delete(pc)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking pc changes.

  ## Examples

      iex> change_pc(pc)
      %Ecto.Changeset{data: %Entity{}}

  """
  def change_pc(%Entity{} = pc, attrs \\ %{}) do
    Entities.change_entity(pc, PC, attrs)
  end
end
