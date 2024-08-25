defmodule BlackIronWeb.SidebarController do
  @moduledoc """
  Controller for the sidebar
  """
  use BlackIronWeb, :controller

  def show(conn, params) do
    render(conn, :show,
      campaignId: params["campaignId"],
      cslug: params["cslug"],
      sidebar_marker: true
    )
  end
end
