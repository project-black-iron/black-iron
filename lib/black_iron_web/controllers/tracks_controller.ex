defmodule BlackIronWeb.TracksController do
  @moduledoc """
  Controller for the /play/tracks page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
