defmodule BlackIron.EntitiesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.Entities` context.
  """

  @doc """
  Generate a entity.
  """
  def entity_fixture(attrs \\ %{}) do
    {:ok, entity} =
      attrs
      |> Enum.into(%{
        data: %{},
        deleted_at: ~N[2024-08-27 18:58:00],
        pid: "some pid",
        rev: "some rev",
        revisions: ["option1", "option2"]
      })
      |> BlackIron.Entities.create_entity()

    entity
  end
end
