defmodule BlackIronWeb.JournalsController do
  @moduledoc """
  Controller for the /campaigns/journals page
  """
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
