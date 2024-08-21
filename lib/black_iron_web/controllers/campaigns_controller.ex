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

  def create(conn, params) do
    case Campaigns.create_campaign(conn.assigns[:current_user], params["campaign"]) do
      {:ok, campaign} ->
        render(conn, :create, campaign: campaign)
      {:error, changeset} ->
        render(conn, :create, campaign: changeset.errors)
    end
  end
end
