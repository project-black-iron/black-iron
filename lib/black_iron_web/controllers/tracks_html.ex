defmodule BlackIronWeb.TracksHTML do
  @moduledoc """
  HTML view for /play/npcs
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Tracks list</h3>
    <ul class="tracks-list">
      <!-- Tracks go here -->
      <li><a href="/play/campaigns/1/tracks/1">Track 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <h3>Here's the track</h3>
    """
  end
end
