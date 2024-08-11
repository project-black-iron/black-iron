defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /play/campaigns page
  """
  use BlackIronWeb, :controller

  def index(conn, params) do
    render(conn, :index, campaignId: params["campaignId"])
  end

  def show(conn, params) do
    render(conn, :show, campaignId: params["campaignId"])
  end
end
