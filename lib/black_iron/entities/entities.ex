defmodule BlackIron.Entities do
  @moduledoc """
  The Entities context.
  """

  import Ecto.Query, warn: false
  alias BlackIron.Repo

  alias BlackIron.Entities.Entity

  # @doc """
  # Returns the list of entities.

  # ## Examples

  #     iex> list_entities()
  #     [%Entity{}, ...]

  # """
  # def list_entities do
  #   Repo.all(Entity)
  # end

  # @doc """
  # Gets a single entity.

  # Raises `Ecto.NoResultsError` if the Entity does not exist.

  # ## Examples

  #     iex> get_entity!(123)
  #     %Entity{}

  #     iex> get_entity!(456)
  #     ** (Ecto.NoResultsError)

  # """
  # def get_entity!(id), do: Repo.get!(Entity, id)

  @doc """
  Creates a entity.

  ## Examples

      iex> create_entity(%{field: value})
      {:ok, %Entity{}}

      iex> create_entity(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_entity(entype, attrs \\ %{}) do
    %Entity{}
    |> Entity.changeset(attrs |> put_rev(%Entity{}), entype)
    |> Repo.insert()
  end

  # @doc """
  # Updates a entity.

  # ## Examples

  #     iex> update_entity(entity, %{field: new_value})
  #     {:ok, %Entity{}}

  #     iex> update_entity(entity, %{field: bad_value})
  #     {:error, %Ecto.Changeset{}}

  # """
  # def update_entity(%Entity{} = entity, attrs) do
  #   entity
  #   |> Entity.changeset(attrs)
  #   |> Repo.update()
  # end

  # @doc """
  # Deletes a entity.

  # ## Examples

  #     iex> delete_entity(entity)
  #     {:ok, %Entity{}}

  #     iex> delete_entity(entity)
  #     {:error, %Ecto.Changeset{}}

  # """
  # def delete_entity(%Entity{} = entity) do
  #   Repo.delete(entity)
  # end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking entity changes.

  ## Examples

      iex> change_entity(entity)
      %Ecto.Changeset{data: %Entity{}}

  """
  def change_entity(%Entity{} = entity, attrs, entype) do
    Entity.changeset(entity, attrs, entype)
  end
  
  defp put_rev(attrs, obj) do
    if !attrs["rev"] || !attrs["revisions"] do
      rev = Ecto.UUID.generate()
      revs = [rev | obj.revisions || []]
      attrs |> Map.put("rev", rev) |> Map.put("revisions", revs)
    else
      attrs
    end
  end
end
