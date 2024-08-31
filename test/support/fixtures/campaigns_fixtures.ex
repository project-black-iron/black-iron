defmodule BlackIron.CampaignsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.Campaigns` context.
  """

  @doc """
  Generate a campaign.
  """
  def campaign_fixture(attrs \\ %{}) do
    user = BlackIron.AccountsFixtures.user_fixture()

    {:ok, campaign} =
      BlackIron.Campaigns.create_campaign(
        user,
        attrs
        |> Enum.into(%{
          "data" =>
            Map.get(attrs, "data", %{})
            |> Enum.into(%{
              "name" => "some name",
              "description" => "some description"
            })
        })
      )

    campaign
  end
end
