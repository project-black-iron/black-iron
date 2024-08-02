defmodule BlackIronWeb.TracksHTML do
  @moduledoc """
  HTML view for /campaigns/npcs
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <ul>
      <!-- Tracks go here -->
    </ul>
    """
  end
end
