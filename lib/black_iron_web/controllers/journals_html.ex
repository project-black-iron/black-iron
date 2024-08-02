defmodule BlackIronWeb.JournalsHTML do
  @moduledoc """
  HTML view for /campaigns/journals
  """
  use BlackIronWeb, :html

  def show(assigns) do
    ~H"""
    <h3>Here's the journal</h3>
    <textarea></textarea>
    """
  end
end
