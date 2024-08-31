defmodule BlackIron.CampaignsTest do
  use BlackIron.DataCase

  alias BlackIron.AccountsFixtures
  alias BlackIron.Campaigns
  alias BlackIron.Campaigns.Campaign
  alias BlackIron.Entities.Entity
  alias BlackIron.Repo

  describe "campaigns" do
    import BlackIron.CampaignsFixtures

    @invalid_attrs %{"pid" => nil, "data" => %{"name" => nil, "description" => nil}}

    @tag :skip
    test "list_campaigns_for_ser/1 returns all campaigns for a given user" do
    end

    test "create_campaign/2 with valid data creates a campaign" do
      valid_attrs = %{
        "data" => %{
          "name" => "some name",
          "description" => "some description"
        }
      }

      user = AccountsFixtures.user_fixture()
      assert {:ok, %Entity{} = campaign} = Campaigns.create_campaign(user, valid_attrs)
      assert campaign.data.name == "some name"
      assert campaign.data.description == "some description"
    end

    test "create_campaign/2 with valid entity fields creates a campaign" do
      pid = BlackIron.Utils.gen_pid()
      rev = Ecto.UUID.generate()

      valid_attrs = %{
        "pid" => pid,
        "rev" => rev,
        "revisions" => [rev],
        "data" => %{
          "name" => "some name",
          "description" => "some description"
        }
      }

      user = AccountsFixtures.user_fixture()
      assert {:ok, %Entity{} = campaign} = Campaigns.create_campaign(user, valid_attrs)
      assert campaign.data.name == "some name"
      assert campaign.data.description == "some description"
      assert campaign.pid == pid
      assert campaign.rev == rev
      assert campaign.revisions == [rev]
    end

    test "create_campaign/2 with invalid data returns error changeset" do
      user = AccountsFixtures.user_fixture()
      assert {:error, %Ecto.Changeset{}} = Campaigns.create_campaign(user, @invalid_attrs)
    end

    @tag :skip
    test "update_campaign/3 with valid data updates the campaign" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:handle)
        |> Accounts.get_user_by_handle()

      newpid = BlackIron.Utils.gen_pid()

      update_attrs = %{
        name: "some updated name",
        pid: newpid,
        description: "some updated description"
      }

      assert {:ok, %Campaign{} = campaign} =
               Campaigns.update_campaign(user, campaign, update_attrs)

      assert campaign.name == "some updated name"
      assert campaign.pid == newpid
      assert campaign.description == "some updated description"
    end

    @tag :skip
    test "update_campaign/3 with invalid data returns error changeset" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:handle)
        |> Accounts.get_user_by_handle()

      assert {:error, %Ecto.Changeset{}} =
               Campaigns.update_campaign(user, campaign, @invalid_attrs)

      assert campaign == Campaigns.get_campaign!(campaign.id)
    end

    @tag :skip
    test "delete_campaign/2 deletes the campaign" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:handle)
        |> Accounts.get_user_by_handle()

      assert {:ok, %Campaign{}} = Campaigns.delete_campaign(user, campaign)
      assert_raise Ecto.NoResultsError, fn -> Campaigns.get_campaign!(campaign.id) end
    end

    test "change_campaign/2 returns a campaign changeset" do
      campaign = campaign_fixture()
      assert %Ecto.Changeset{} = Campaigns.change_campaign(campaign)
    end
  end
end
