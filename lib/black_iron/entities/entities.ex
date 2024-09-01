defmodule BlackIron.Entities do
  @moduledoc """
  The Entities context.
  """

  import Ecto.Query, warn: false

  alias BlackIron.Entities.Entity

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking entity changes.

  ## Examples

      iex> change_entity(entity)
      %Ecto.Changeset{data: %Entity{}}

  """
  def change_entity(%Entity{} = entity, enstruct, attrs \\ %{}) do
    Entity.changeset(entity, enstruct, attrs |> put_rev(entity))
  end

  def is_entype(q, entype) do
    q
    |> where([entity: e], fragment("? ->> '__type__'", e.data) == ^to_string(entype))
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
