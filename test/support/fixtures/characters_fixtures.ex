defmodule BlackIron.CharactersFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.Characters` context.
  """

  @doc """
  Generate a character.
  """
  def character_fixture(attrs \\ %{}) do
    {:ok, character} =
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
      |> BlackIron.Characters.create_character()

    character
  end
end
