defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /play/campaigns page
  """
  use BlackIronWeb, :controller

  alias BlackIron.Campaigns

  def index(conn, _params) do
    campaigns =
      case conn.assigns[:current_user] do
        nil -> []
        user -> Campaigns.list_campaigns_for_user(user)
      end

    render(conn, :index, campaigns: campaigns)
  end

  def show(conn, params) do
    render(conn, :show, campaignId: params["campaignId"])
  end
end
