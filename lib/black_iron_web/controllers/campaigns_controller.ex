defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /play/campaigns page
  """
  use BlackIronWeb, :controller

  alias BlackIron.Campaigns

  def index(conn, _params) do
    campaigns = case conn.assigns[:current_user] do
      nil -> []
      user -> Campaigns.list_campaigns_for_user(user) |> Enum.map(&%{
        id: &1.id,
        name: &1.name,
        description: &1.description,
        slug: &1.slug,
        roles: &1.roles
      })
    end
    render(conn, :index, campaigns: campaigns)
  end

  def show(conn, params) do
    render(conn, :show, campaignId: params["campaignId"])
  end
end
