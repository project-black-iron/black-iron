defmodule BlackIron.PCsTest do
  use BlackIron.DataCase

  alias BlackIron.PCs

  describe "pcs" do
    alias BlackIron.PCs.PC

    import BlackIron.PCsFixtures

    @invalid_attrs %{
      alias: nil,
      name: nil,
      pid: nil,
      description: nil,
      pronouns: nil,
      initiative: nil,
      portrait: nil,
      xp_added: nil,
      xp_spent: nil
    }

    test "list_pcs/0 returns all PCs" do
      pc = pc_fixture()
      assert PCs.list_pcs() == [pc]
    end

    test "get_pc!/1 returns the PC with given id" do
      pc = pc_fixture()
      assert PCs.get_pc!(pc.id) == pc
    end

    test "create_pc/1 with valid data creates a pc" do
      valid_attrs = %{
        alias: "some alias",
        name: "some name",
        pid: "some pid",
        description: "some description",
        pronouns: "some pronouns",
        initiative: "some initiative",
        portrait: "some portrait",
        xp_added: 42,
        xp_spent: 42
      }

      assert {:ok, %PC{} = pc} = PCs.create_pc(valid_attrs)
      assert pc.alias == "some alias"
      assert pc.name == "some name"
      assert pc.pid == "some pid"
      assert pc.description == "some description"
      assert pc.pronouns == "some pronouns"
      assert pc.initiative == "some initiative"
      assert pc.portrait == "some portrait"
      assert pc.xp_added == 42
      assert pc.xp_spent == 42
    end

    test "create_pc/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = PCs.create_pc(@invalid_attrs)
    end

    test "update_pc/2 with valid data updates the PC" do
      pc = pc_fixture()

      update_attrs = %{
        alias: "some updated alias",
        name: "some updated name",
        pid: "some updated pid",
        description: "some updated description",
        pronouns: "some updated pronouns",
        initiative: "some updated initiative",
        portrait: "some updated portrait",
        xp_added: 43,
        xp_spent: 43
      }

      assert {:ok, %PC{} = pc} =
               PCs.update_pc(pc, update_attrs)

      assert pc.alias == "some updated alias"
      assert pc.name == "some updated name"
      assert pc.pid == "some updated pid"
      assert pc.description == "some updated description"
      assert pc.pronouns == "some updated pronouns"
      assert pc.initiative == "some updated initiative"
      assert pc.portrait == "some updated portrait"
      assert pc.xp_added == 43
      assert pc.xp_spent == 43
    end

    test "update_pc/2 with invalid data returns error changeset" do
      pc = pc_fixture()
      assert {:error, %Ecto.Changeset{}} = PCs.update_pc(pc, @invalid_attrs)
      assert pc == PCs.get_pc!(pc.id)
    end

    test "delete_pc/1 deletes the PC" do
      pc = pc_fixture()
      assert {:ok, %PC{}} = PCs.delete_pc(pc)
      assert_raise Ecto.NoResultsError, fn -> PCs.get_pc!(pc.id) end
    end

    test "change_pc/1 returns a PC changeset" do
      pc = pc_fixture()
      assert %Ecto.Changeset{} = PCs.change_pc(pc)
    end
  end
end
