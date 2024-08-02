defmodule BlackIronWeb.LoreController do
  @moduledoc """
  Controller for the /campaigns/lore page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
