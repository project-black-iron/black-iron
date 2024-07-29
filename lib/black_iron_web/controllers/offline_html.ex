defmodule BlackIronWeb.OfflineHTML do
  @moduledoc """
  Templates for offline pages.
  """
  use BlackIronWeb, :html

  def site(assigns) do
    ~H"""
    You're offline. Refresh when you have internet again.
    """
  end
end
