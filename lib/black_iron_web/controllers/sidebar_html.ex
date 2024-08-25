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
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/journals"}>
            Journals
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/characters"}>
            Characters
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/npcs"}>
            NPCs
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/lore"}>
            Lore
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/tracks"}>
            Tracks and Clocks
          </a>
        </li>
        <li>
          <a href={~p"/play/campaigns/#{assigns[:campaignId]}/#{assigns[:cslug]}/worlds"}>Worlds</a>
        </li>
      </ul>
    </nav>
    """
  end
end
