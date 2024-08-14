defmodule BlackIron.CampaignsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `BlackIron.Campaigns` context.
  """

  @doc """
  Generate a campaign.
  """
  def campaign_fixture(attrs \\ %{}) do
    {:ok, campaign} =
      attrs
      |> Enum.into(%{
        name: "some name",
        description: "some description",
        slug: "some slug"
      })
      |> BlackIron.Campaigns.create_campaign()

    campaign
  end
end
