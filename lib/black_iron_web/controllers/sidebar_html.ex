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
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/journals"}>
            Journals
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/characters"}>
            Characters
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/npcs"}>
            NPCs
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/lore"}>
            Lore
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/tracks"}>
            Tracks and Clocks
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/sidebar/worlds"}>Worlds</a>
        </li>
      </ul>
    </nav>
    """
  end
end
