defmodule BlackIron.PCsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.PCs` context.
  """

  @doc """
  Generate a pc.
  """
  def pc_fixture(attrs \\ %{}) do
    {:ok, pc} =
      attrs
      |> Enum.into(%{
        alias: "some alias",
        description: "some description",
        initiative: "some initiative",
        name: "some name",
        pid: "some pid",
        portrait: "some portrait",
        pronouns: "some pronouns",
        xp_added: 42,
        xp_spent: 42
      })
      |> BlackIron.PCs.create_pc()

    pc
  end
end
