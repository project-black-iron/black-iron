defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /play/campaigns page
  """
  use BlackIronWeb, :controller

  alias BlackIron.Campaigns

  def show(conn, params) do
    render(conn, :show, campaignId: params["campaignId"])
  end

  def index(conn, _params) do
    campaigns =
      case conn.assigns[:current_user] do
        nil -> []
        user -> Campaigns.list_campaigns_for_user(user)
      end

    render(conn, :index,
      campaigns: campaigns,
      changeset: Campaigns.change_campaign(%Campaigns.Campaign{})
    )
  end

  def create(conn, params) do
    res = Campaigns.create_campaign(conn.assigns[:current_user], params["campaign"])
    campaigns = Campaigns.list_campaigns_for_user(conn.assigns[:current_user])

    case res do
      {:ok, _campaign} ->
        render(conn, :index,
          campaigns: campaigns,
          changeset: Campaigns.change_campaign(%Campaigns.Campaign{})
        )

      {:error, changeset} ->
        render(conn, :index, campaigns: campaigns, changeset: changeset)
    end
  end
end
