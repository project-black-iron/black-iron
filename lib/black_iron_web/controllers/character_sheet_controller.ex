defmodule BlackIronWeb.CharacterSheetController do
  use BlackIronWeb, :controller

  def show(conn, _params) do
    render(conn, :show)
  end
end
