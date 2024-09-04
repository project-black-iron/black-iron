defmodule BlackIronWeb.SidebarHTML do
  @moduledoc """
  HTML view for the sidebar
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <nav class="sidebar">
      <ul>
        <li><a target="_top" href={~p"/play/campaigns/"}>Campaigns</a></li>
        <li>
          <a href="journals">
            <%= gettext("Journals") %>
          </a>
        </li>
        <li>
          <a href="pcs">
            <%= gettext("PCs") %>
          </a>
        </li>
        <li>
          <a href="npcs">
            <%= gettext("NPCs") %>
          </a>
        </li>
        <li>
          <a href="lore">
            <%= gettext("Lore") %>
          </a>
        </li>
        <li>
          <a href="tracks">
            <%= gettext("Tracks") %>
          </a>
        </li>
        <li>
          <a href="worlds"><%= gettext("Worlds") %></a>
        </li>
      </ul>
    </nav>
    """
  end
end
