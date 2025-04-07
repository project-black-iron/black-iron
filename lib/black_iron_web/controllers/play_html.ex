defmodule BlackIronWeb.PlayHTML do
  @moduledoc """
  HTML view for /play
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <h3>
      <%= gettext("Let's Play!") %>
    </h3>
    <ul>
      <li><a href={~p"/play/campaigns"}><%= gettext("My Campaigns") %></a></li>
      <li><a href="#"><%= gettext("How to Play") %></a></li>
      <li><a href="#"><%= gettext("Friends") %></a></li>
    </ul>
    """
  end
end
