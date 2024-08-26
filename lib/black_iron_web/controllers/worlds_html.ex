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
      <li><a href="1/my-world">World 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <p>World stuff/locations go here</p>
    """
  end
end
