defmodule BlackIronWeb.WorldsController do
  @moduledoc """
  Controller for the /play/world page
  """
  use BlackIronWeb, :controller

  def index(conn, params) do
    render(conn, :index, campaignId: params["campaignId"], cslug: params["cslug"])
  end

  def show(conn, params) do
    render(conn, :show, campaignId: params["campaignId"], cslug: params["cslug"])
  end
end
