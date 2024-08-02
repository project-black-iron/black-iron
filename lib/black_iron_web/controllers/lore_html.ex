defmodule BlackIronWeb.LoreHTML do
  @moduledoc """
  HTML view for /campaigns/lore
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <p>Lore goes here</p>
    """
  end
end
