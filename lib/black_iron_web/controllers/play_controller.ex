defmodule BlackIronWeb.PlayController do
  @moduledoc """
  Controller for the /play page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
