defmodule BlackIronWeb.WorldController do
  @moduledoc """
  Controller for the /campaigns/world page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
