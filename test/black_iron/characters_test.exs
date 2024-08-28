defmodule BlackIron.CharactersTest do
  use BlackIron.DataCase

  alias BlackIron.Characters

  describe "characters" do
    alias BlackIron.Characters.Character

    import BlackIron.CharactersFixtures

    @invalid_attrs %{alias: nil, name: nil, pid: nil, description: nil, pronouns: nil, initiative: nil, portrait: nil, xp_added: nil, xp_spent: nil}

    test "list_characters/0 returns all characters" do
      character = character_fixture()
      assert Characters.list_characters() == [character]
    end

    test "get_character!/1 returns the character with given id" do
      character = character_fixture()
      assert Characters.get_character!(character.id) == character
    end

    test "create_character/1 with valid data creates a character" do
      valid_attrs = %{alias: "some alias", name: "some name", pid: "some pid", description: "some description", pronouns: "some pronouns", initiative: "some initiative", portrait: "some portrait", xp_added: 42, xp_spent: 42}

      assert {:ok, %Character{} = character} = Characters.create_character(valid_attrs)
      assert character.alias == "some alias"
      assert character.name == "some name"
      assert character.pid == "some pid"
      assert character.description == "some description"
      assert character.pronouns == "some pronouns"
      assert character.initiative == "some initiative"
      assert character.portrait == "some portrait"
      assert character.xp_added == 42
      assert character.xp_spent == 42
    end

    test "create_character/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Characters.create_character(@invalid_attrs)
    end

    test "update_character/2 with valid data updates the character" do
      character = character_fixture()
      update_attrs = %{alias: "some updated alias", name: "some updated name", pid: "some updated pid", description: "some updated description", pronouns: "some updated pronouns", initiative: "some updated initiative", portrait: "some updated portrait", xp_added: 43, xp_spent: 43}

      assert {:ok, %Character{} = character} = Characters.update_character(character, update_attrs)
      assert character.alias == "some updated alias"
      assert character.name == "some updated name"
      assert character.pid == "some updated pid"
      assert character.description == "some updated description"
      assert character.pronouns == "some updated pronouns"
      assert character.initiative == "some updated initiative"
      assert character.portrait == "some updated portrait"
      assert character.xp_added == 43
      assert character.xp_spent == 43
    end

    test "update_character/2 with invalid data returns error changeset" do
      character = character_fixture()
      assert {:error, %Ecto.Changeset{}} = Characters.update_character(character, @invalid_attrs)
      assert character == Characters.get_character!(character.id)
    end

    test "delete_character/1 deletes the character" do
      character = character_fixture()
      assert {:ok, %Character{}} = Characters.delete_character(character)
      assert_raise Ecto.NoResultsError, fn -> Characters.get_character!(character.id) end
    end

    test "change_character/1 returns a character changeset" do
      character = character_fixture()
      assert %Ecto.Changeset{} = Characters.change_character(character)
    end
  end
end
