defmodule BlackIronWeb.SidebarHTML do
  @moduledoc """
  HTML view for the sidebar
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <nav class="sidebar">
      <ul>
        <li><a target="_top" href={~p"/play/campaigns"}>Campaigns</a></li>
        <li>
          <a href="journals">
            Journals
          </a>
        </li>
        <li>
          <a href="characters">
            Characters
          </a>
        </li>
        <li>
          <a href="npcs">
            NPCs
          </a>
        </li>
        <li>
          <a href="lore">
            Lore
          </a>
        </li>
        <li>
          <a href="tracks">
            Tracks and Clocks
          </a>
        </li>
        <li>
          <a href="worlds">Worlds</a>
        </li>
      </ul>
    </nav>
    """
  end
end
