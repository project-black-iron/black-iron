defmodule BlackIronWeb.CampaignsHTML do
  @moduledoc """
  HTML view for /campaigns
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <ul class="campaigns-list">
      <!-- Campaigns go here -->
    </ul>
    """
  end
end
