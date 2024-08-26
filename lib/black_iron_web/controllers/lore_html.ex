defmodule BlackIronWeb.LoreHTML do
  @moduledoc """
  HTML view for /play/lore
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Lore list</h3>
    <ul class="lore-list">
      <!-- Lore goes here -->
      <li><a href="1/lore-1">Lore 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <p>Lore goes here</p>
    """
  end
end
