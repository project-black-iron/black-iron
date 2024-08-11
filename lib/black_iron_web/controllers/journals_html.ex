defmodule BlackIronWeb.JournalsHTML do
  @moduledoc """
  HTML view for /play/journals
  """
  use BlackIronWeb, :html

  def index(assigns) do
    ~H"""
    <h3>Journals list</h3>
    <ul class="journals-list">
      <!-- Journals go here -->
      <li><a href="/play/campaign/1/journals/1">Journal 1</a></li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <h3>Here's the journal</h3>
    <textarea></textarea>
    """
  end
end
