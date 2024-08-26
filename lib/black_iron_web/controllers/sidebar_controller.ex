defmodule BlackIronWeb.SidebarController do
  @moduledoc """
  Controller for the sidebar
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show, sidebar_marker: true)
  end
end
