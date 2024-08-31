defmodule BlackIron.EntitiesTest do
  use BlackIron.DataCase

  alias BlackIron.Entities

  describe "entities" do
    alias BlackIron.Entities.Entity

    import BlackIron.EntitiesFixtures

    @invalid_attrs %{data: nil, pid: nil, rev: nil, revisions: nil, deleted_at: nil}

    test "list_entities/0 returns all entities" do
      entity = entity_fixture()
      assert Entities.list_entities() == [entity]
    end

    test "get_entity!/1 returns the entity with given id" do
      entity = entity_fixture()
      assert Entities.get_entity!(entity.id) == entity
    end

    test "create_entity/1 with valid data creates a entity" do
      valid_attrs = %{
        data: %{},
        pid: "some pid",
        rev: "some rev",
        revisions: ["option1", "option2"],
        deleted_at: ~N[2024-08-27 18:58:00]
      }

      assert {:ok, %Entity{} = entity} = Entities.create_entity(valid_attrs)
      assert entity.data == %{}
      assert entity.pid == "some pid"
      assert entity.rev == "some rev"
      assert entity.revisions == ["option1", "option2"]
      assert entity.deleted_at == ~N[2024-08-27 18:58:00]
    end

    test "create_entity/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Entities.create_entity(@invalid_attrs)
    end

    test "update_entity/2 with valid data updates the entity" do
      entity = entity_fixture()

      update_attrs = %{
        data: %{},
        pid: "some updated pid",
        rev: "some updated rev",
        revisions: ["option1"],
        deleted_at: ~N[2024-08-28 18:58:00]
      }

      assert {:ok, %Entity{} = entity} = Entities.update_entity(entity, update_attrs)
      assert entity.data == %{}
      assert entity.pid == "some updated pid"
      assert entity.rev == "some updated rev"
      assert entity.revisions == ["option1"]
      assert entity.deleted_at == ~N[2024-08-28 18:58:00]
    end

    test "update_entity/2 with invalid data returns error changeset" do
      entity = entity_fixture()
      assert {:error, %Ecto.Changeset{}} = Entities.update_entity(entity, @invalid_attrs)
      assert entity == Entities.get_entity!(entity.id)
    end

    test "delete_entity/1 deletes the entity" do
      entity = entity_fixture()
      assert {:ok, %Entity{}} = Entities.delete_entity(entity)
      assert_raise Ecto.NoResultsError, fn -> Entities.get_entity!(entity.id) end
    end

    test "change_entity/1 returns a entity changeset" do
      entity = entity_fixture()
      assert %Ecto.Changeset{} = Entities.change_entity(entity)
    end
  end
end
