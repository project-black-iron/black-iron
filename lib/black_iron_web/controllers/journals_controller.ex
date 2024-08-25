defmodule BlackIronWeb.JournalsController do
  @moduledoc """
  Controller for the /play/journals page
  """
  use BlackIronWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end

  def show(conn, params) do
    # TODO(@zkat): Obviously, fetch the actual thing and all that
    title = if conn.assigns[:preload] do
      ""
    else
      params["slug"]
    end
    render(conn, :show, title: title)
  end
end
