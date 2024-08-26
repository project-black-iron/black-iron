defmodule BlackIronWeb.NPCsHTML do
  @moduledoc """
  HTML view for /play/npcs
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>NPCs list</h3>
    <ul class="npcs-list">
      <!-- NPCs go here -->
      <li><a href="1/npc-1">NPC 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <ul>
      <!-- NPCs go here -->
    </ul>
    """
  end
end
