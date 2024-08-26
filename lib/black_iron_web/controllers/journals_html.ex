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
      <li>
        <!-- No relative URLs here. We _always_ want to go to top -->
        <a
          target="_top"
          href={
            ~p"/play/campaigns/#{assigns.conn.params["campaignId"]}/#{assigns.conn.params["cslug"]}/journals/1/chapter-1"
          }
        >
          Chapter 1
        </a>
      </li>
    </ul>
    """
  end

  def show(assigns) do
    ~H"""
    <article class="journal-page">
      <section class="journal">
        <header>
          <h3>Title: <%= assigns[:title] %></h3>
        </header>
        <article>
          <textarea>type stuff here!</textarea>
        </article>
      </section>
      <section class="sidebar">
        <iframe src="/play/campaigns/1/campaign-name/sidebar"></iframe>
      </section>
    </article>
    """
  end
end
