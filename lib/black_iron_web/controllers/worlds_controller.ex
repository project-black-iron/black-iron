defmodule BlackIronWeb.WorldsController do
  @moduledoc """
  Controller for the /play/world page
  """
  use BlackIronWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end

  def show(conn, _params) do
    render(conn, :show)
  end
end
