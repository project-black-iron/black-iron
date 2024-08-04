defmodule BlackIronWeb.NPCsHTML do
  @moduledoc """
  HTML view for /play/npcs
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <ul>
      <!-- NPCs go here -->
    </ul>
    """
  end
end
