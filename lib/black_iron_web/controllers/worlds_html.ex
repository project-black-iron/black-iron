defmodule BlackIronWeb.WorldsHTML do
  @moduledoc """
  HTML view for /play/world
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Worlds list</h3>
    <ul class="worlds-list">
      <!-- Worlds go here -->
      <li><a href="/play/campaigns/1/worlds/1">World 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <p>World stuff/locations go here</p>
    """
  end
end
