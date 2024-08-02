defmodule BlackIronWeb.WorldHTML do
  @moduledoc """
  HTML view for /campaigns/world
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <p>World stuff/locations go here</p>
    """
  end
end
