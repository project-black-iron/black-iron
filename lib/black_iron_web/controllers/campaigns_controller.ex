defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /play/campaigns page
  """
  use BlackIronWeb, :controller

  alias BlackIron.Campaigns
  alias BlackIron.Entities.Entity

  def show(conn, params) do
    campaign = Campaigns.get_campaign(conn.assigns[:current_user], params["campaign_pid"])
    render(conn, :show, campaign: campaign)
  end

  def index(conn, _params) do
    campaigns =
      case {conn.assigns[:current_user], conn.assigns[:preload]} do
        {_, true} -> []
        {nil, _} -> []
        {user, _} -> Campaigns.list_campaigns_for_user(user)
      end

    render(conn, :index,
      campaigns: campaigns,
      changeset: Campaigns.change_campaign(%Entity{}, %{})
    )
  end

  def create(conn, params) do
    res = Campaigns.create_campaign(conn.assigns[:current_user], params["entity"])
    campaigns = Campaigns.list_campaigns_for_user(conn.assigns[:current_user])

    case res do
      {:ok, _campaign} ->
        render(conn, :index,
          campaigns: campaigns,
          changeset: Campaigns.change_campaign(%Entity{}, %{})
        )

      {:error, changeset} ->
        render(conn, :index, campaigns: campaigns, changeset: changeset)
    end
  end
end
