defmodule BlackIronWeb.WorldsHTML do
  @moduledoc """
  HTML view for /play/world
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <p>World stuff/locations go here</p>
    """
  end
end
