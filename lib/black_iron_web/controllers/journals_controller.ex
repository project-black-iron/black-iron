defmodule BlackIronWeb.JournalsController do
  @moduledoc """
  Controller for the /play/journals page
  """
  use BlackIronWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end

  def show(conn, _params) do
    render(conn, :show)
  end
end
