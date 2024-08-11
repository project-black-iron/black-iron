defmodule BlackIronWeb.CharacterSheetController do
  use BlackIronWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end

  def show(conn, _params) do
    render(conn, :show)
  end
end
