defmodule BlackIron.CampaignsTest do
  use BlackIron.DataCase

  alias BlackIron.AccountsFixtures
  alias BlackIron.Campaigns
  alias BlackIron.Repo

  describe "campaigns" do
    alias BlackIron.Campaigns.Campaign

    import BlackIron.CampaignsFixtures

    @invalid_attrs %{name: nil, pid: nil, description: nil}

    test "list_campaigns/1 returns all campaigns" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:username)
        |> Accounts.get_user_by_username()

      assert Campaigns.list_campaigns(user) == [campaign]
    end

    test "get_campaign!/1 returns the campaign with given id" do
      campaign = campaign_fixture()
      assert Campaigns.get_campaign!(campaign.id) == campaign
    end

    test "create_campaign/2 with valid data creates a campaign" do
      pid = BlackIron.Utils.gen_pid()
      valid_attrs = %{name: "some name", pid: pid, description: "some description"}

      user = AccountsFixtures.user_fixture()
      assert {:ok, %Campaign{} = campaign} = Campaigns.create_campaign(user, valid_attrs)
      assert campaign.name == "some name"
      assert campaign.pid == pid
      assert campaign.description == "some description"
    end

    test "create_campaign/1 with invalid data returns error changeset" do
      user = AccountsFixtures.user_fixture()
      assert {:error, %Ecto.Changeset{}} = Campaigns.create_campaign(user, @invalid_attrs)
    end

    test "update_campaign/3 with valid data updates the campaign" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:username)
        |> Accounts.get_user_by_username()

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

    test "update_campaign/3 with invalid data returns error changeset" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:username)
        |> Accounts.get_user_by_username()

      assert {:error, %Ecto.Changeset{}} =
               Campaigns.update_campaign(user, campaign, @invalid_attrs)

      assert campaign == Campaigns.get_campaign!(campaign.id)
    end

    test "delete_campaign/2 deletes the campaign" do
      campaign = campaign_fixture() |> Repo.preload(:memberships)

      user =
        campaign.memberships
        |> List.first()
        |> Map.get(:username)
        |> Accounts.get_user_by_username()

      assert {:ok, %Campaign{}} = Campaigns.delete_campaign(user, campaign)
      assert_raise Ecto.NoResultsError, fn -> Campaigns.get_campaign!(campaign.id) end
    end

    test "change_campaign/1 returns a campaign changeset" do
      campaign = campaign_fixture()
      assert %Ecto.Changeset{} = Campaigns.change_campaign(campaign)
    end
  end
end
