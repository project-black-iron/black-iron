defmodule BlackIronWeb.PlayHTML do
  @moduledoc """
  HTML view for /play
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <p>
      This is the Play page. It's the entry point for all offline-first
      game playing.
    </p>
    <ul class="campaigns-list">
      <!-- Campaigns go here -->
    </ul>
    """
  end
end
