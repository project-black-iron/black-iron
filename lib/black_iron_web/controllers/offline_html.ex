defmodule BlackIronWeb.OfflineHTML do
  @moduledoc """
  Templates for offline pages.
  """
  use BlackIronWeb, :html

  def site(assigns) do
    # TODO(@zkat): gettext text here when we have an actual offline page
    # designed.
    ~H"""
    You're offline. Refresh when you have internet again.
    """
  end
end
