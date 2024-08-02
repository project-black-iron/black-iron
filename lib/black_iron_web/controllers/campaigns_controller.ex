defmodule BlackIronWeb.CampaignsController do
  @moduledoc """
  Controller for the /campaigns page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
